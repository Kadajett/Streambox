import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

/**
 * AdminGuard - Provides admin access via two methods:
 *
 * 1. Dev Backdoor: Set X-Admin-Key header with ADMIN_SECRET env var
 *    - Quick access for development/testing
 *    - Only works if ADMIN_SECRET is configured AND not in production
 *    - DISABLED in production for security
 *
 * 2. JWT with admin role: Standard JWT auth with user.role === 'admin'
 *    - Production-ready admin access
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    // Method 1: Dev backdoor via X-Admin-Key header (DISABLED in production)
    if (!isProduction) {
      const adminKey = request.headers['x-admin-key'] as string;
      const adminSecret = this.configService.get<string>('ADMIN_SECRET');

      if (adminKey && adminSecret && adminKey === adminSecret) {
        // Backdoor access granted - inject a synthetic admin user
        (request as any).user = {
          sub: 'admin-backdoor',
          email: 'admin@system',
          role: 'admin',
          isBackdoor: true,
        };
        return true;
      }
    }

    // Method 2: Standard JWT auth with admin role check
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid authentication provided');
    }

    const token = authHeader.substring(7);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Check if user has admin role
      if (payload.role !== 'admin') {
        throw new ForbiddenException('Admin access required');
      }

      (request as any).user = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
