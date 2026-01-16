// Load environment variables FIRST before any modules
import 'dotenv/config';

import {
  Logger,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';

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
    Logger.error('STORAGE_DIR environment variable is not set!', 'Bootstrap');
    process.exit(1);
  }
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
