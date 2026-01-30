// Load environment variables FIRST before any modules
import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  let app: Awaited<ReturnType<typeof NestFactory.create>>;
  try {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      bodyParser: false,
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

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Handle shutdown signals
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);
    await app.close();
    logger.log('Application shut down gracefully');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.raw({ type: 'application/octet-stream', limit: '2gb' }));

  app.use(cookieParser());

  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Serve static HLS files from data directory
  const dataDir = process.env.STORAGE_PATH;
  if (!dataDir) {
    logger.error('STORAGE_DIR environment variable is not set!');
    process.exit(1);
  }

  // CORS for static media files
  // Default: '*' (wildcard) - intentional for video streaming
  // - HLS video players on any domain need to fetch .m3u8 playlists and .ts segments
  // - Enables video embedding on external sites
  // - Required for CDN distribution
  // - Mobile apps and smart TVs require cross-origin access
  // Set STATIC_CORS_ORIGIN to restrict (e.g., 'https://example.com')
  const staticCorsOrigin = process.env.STATIC_CORS_ORIGIN || '*';

  app.use(
    '/hls',
    express.static(path.join(dataDir, 'hls'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', staticCorsOrigin);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      },
    })
  );
  app.use(
    '/thumbnails',
    express.static(path.join(dataDir, 'hls', 'thumbnails'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', staticCorsOrigin);
        res.setHeader('Cache-Control', 'public, max-age=86400');
      },
    })
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`HLS files served from ${path.join(dataDir, 'hls')}`);
}
bootstrap();
