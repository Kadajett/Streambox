import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, tap } from 'rxjs';
import type { Response, Request } from 'express';

const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const accessToken = request.cookies?.accessToken;
        if (!accessToken) return;

        try {
          const payload = this.jwtService.decode(accessToken) as {
            sub: string;
            email: string;
            exp: number;
            type: string;
          };

          if (!payload?.exp || payload.type !== 'access') return;

          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = payload.exp - now;

          // If token expires within threshold, issue a new one
          if (timeUntilExpiry > 0 && timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
            const newAccessToken = this.jwtService.sign(
              { sub: payload.sub, email: payload.email, type: 'access' },
              { expiresIn: '15m' }
            );

            response.cookie('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: ACCESS_TOKEN_MAX_AGE,
            });
          }
        } catch {
          // Token decode failed, ignore - guard will handle invalid tokens
        }
      })
    );
  }
}
