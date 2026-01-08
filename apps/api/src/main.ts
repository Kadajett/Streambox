import {
  Logger,
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import type { Response } from 'express';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the actual error message/response
    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exception instanceof Error ? exception.message : 'Unknown error';

    // Always log the full error with stack trace
    this.logger.error(`[${status}] ${message}`, exception instanceof Error ? exception.stack : '');

    // In production, don't expose internal error details
    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      statusCode: status,
      // For HttpExceptions (validation errors, etc), return their response
      // For unexpected errors in prod, return generic message
      ...(errorResponse && typeof errorResponse === 'object'
        ? errorResponse
        : {
            message: isProduction && status === 500 ? 'Internal server error' : message,
          }),
    });
  }
}

// Create validation pipe with strictSchemaDeclaration
// Throws if a @Body/@Param/@Query parameter isn't a proper ZodDto
const ZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Use ZodValidationPipe for all request validation
  // This works with DTOs created using createZodDto()
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`, 'Bootstrap');
}
bootstrap();
