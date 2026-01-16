import type { Response, Request } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ZodSerializationException,
  ZodSchemaDeclarationException,
  ZodValidationException,
} from 'nestjs-zod';
import { ZodError } from 'zod';

/**
 * Unified exception filter that handles all exception types:
 * - ZodValidationException: Input validation errors with field-level details
 * - ZodSerializationException: Output serialization errors (logged)
 * - ZodSchemaDeclarationException: Missing schema declarations (dev error)
 * - HttpException: Standard NestJS HTTP exceptions
 * - Everything else: Generic 500 errors
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. ZodValidationException - Input validation errors (nice field-level output)
    if (exception instanceof ZodValidationException) {
      const status = exception.getStatus();
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        const fieldErrors = zodError.issues
          .map((e) => `  • ${e.path.join('.') || '(root)'}: ${e.message}`)
          .join('\n');

        this.logger.warn(
          `[${status}] Validation failed on ${request.method} ${request.url}\n${fieldErrors}`
        );

        response.status(status).json({
          statusCode: status,
          message: 'Validation failed',
          errors: zodError.issues.map((e) => ({
            field: e.path.join('.') || '(root)',
            message: e.message,
          })),
        });
        return;
      }
    }

    // 2. ZodSerializationException - Output serialization errors (log and return standard error)
    if (exception instanceof ZodSerializationException) {
      const status = exception.getStatus();
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(
          `Zod Serialization Error on ${request.method} ${request.url}: ${zodError.message}`,
          zodError.stack
        );
      }

      response.status(status).json({
        statusCode: status,
        message: 'Response serialization error',
      });
      return;
    }

    // 3. ZodSchemaDeclarationException - Missing schema (developer error)
    if (exception instanceof ZodSchemaDeclarationException) {
      this.logger.error(
        `Missing nestjs-zod schema declaration on ${request.method} ${request.url}`,
        exception.stack
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Missing nestjs-zod schema declaration',
      });
      return;
    }

    // 4. Standard HttpException - Use its built-in response
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      // Log 5xx errors as errors, 4xx as warnings
      if (status >= 500) {
        this.logger.error(`[${status}] ${exception.message}`, exception.stack);
      } else {
        this.logger.warn(`[${status}] ${request.method} ${request.url} - ${exception.message}`);
      }

      response.status(status).json(
        typeof errorResponse === 'object'
          ? errorResponse
          : { statusCode: status, message: errorResponse }
      );
      return;
    }

    // 5. Everything else - Generic 500 error
    const message = exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : '';

    this.logger.error(`[500] ${message}`, stack);

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction ? 'Internal server error' : message,
    });
  }
}
