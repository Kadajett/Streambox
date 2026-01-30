import {
  Logger,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TokenRefreshInterceptor } from './auth/interceptors';
import { ChannelsModule } from './channels/channels.module';
import type { Request, Response, NextFunction } from 'express';
import {
  ZodValidationPipe,
  ZodSerializerInterceptor,
} from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { VideosModule } from './videos/videos.module';
import { BullModule } from '@nestjs/bullmq';
import { AdminModule } from './admin/admin.module';
import { FeedModule } from './feed/feed.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AllExceptionsFilter } from './filters';
import { DatabaseModule } from './database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 100,
          ttl: 60_000,
        },
      ],
    }),
    AuthModule,
    ChannelsModule,

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number.parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    VideosModule,
    AdminModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRefreshInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger('HTTP');

  configure(consumer: MiddlewareConsumer) {
    const logger = this.logger;
    consumer
      .apply((req: Request, _res: Response, next: NextFunction) => {
        logger.log(`${req.method} ${req.originalUrl}`);
        next();
      })
      .forRoutes('*');
  }
}
