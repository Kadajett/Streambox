import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
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
  ZodSerializationException,
  ZodSchemaDeclarationException,
} from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD, BaseExceptionFilter } from '@nestjs/core';
import { ZodError } from 'zod';
import { VideosModule } from './videos/videos.module';
import { BullModule } from '@nestjs/bullmq';
import { StorageService } from './storage/storage.service';
import { AdminModule } from './admin/admin.module';
import { FeedModule } from './feed/feed.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// http-exception.filter
@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        this.logger.error(`Zod Serialization Error: ${zodError.message}`, zodError.stack);
      }
    }
    super.catch(exception, host);
  }
}

@Catch(ZodSchemaDeclarationException)
export class ZodSchemaDeclarationExceptionFilter implements ExceptionFilter {
  catch(_exception: ZodSchemaDeclarationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(500).json({
      statusCode: 500,
      message: 'Missing nestjs-zod schema declaration',
    });
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
    { provide: APP_FILTER, useClass: ZodSchemaDeclarationExceptionFilter },
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
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    StorageService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, _res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
      })
      .forRoutes('*');
  }
}
