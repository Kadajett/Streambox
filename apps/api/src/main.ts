// Load environment variables FIRST before any modules
import 'dotenv/config';

import {
  Logger,
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Response } from 'express';
import * as express from 'express';
import * as path from 'node:path';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the actual error message/response
    const errorResponse = exception instanceof HttpException ? exception.getResponse() : null;

    const message = exception instanceof Error ? exception.message : 'Unknown error';

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

async function bootstrap() {
  let app;
  try {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
  } catch (error) {
    console.error('=== BOOTSTRAP ERROR ===');
    console.error('Failed to create NestJS application:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve static HLS files from data directory
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  app.use(
    '/hls',
    express.static(path.join(dataDir, 'hls'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      },
    })
  );
  app.use(
    '/thumbnails',
    express.static(path.join(dataDir, 'hls', 'thumbnails'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400');
      },
    })
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`, 'Bootstrap');
  Logger.log(`HLS files served from ${path.join(dataDir, 'hls')}`, 'Bootstrap');
}
bootstrap();
