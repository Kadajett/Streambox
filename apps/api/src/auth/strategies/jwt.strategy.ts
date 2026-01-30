import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenBlacklistService } from '../token-blacklist.service';

export interface JwtPayload {
  sub: string;
  email: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to Authorization header
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    // Check if the specific token is blacklisted (by jti)
    if (payload.jti) {
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    // Check if all user tokens issued before a certain time are invalid
    if (payload.iat) {
      const isUserInvalidated = await this.tokenBlacklist.isUserTokenInvalidated(
        payload.sub,
        payload.iat
      );
      if (isUserInvalidated) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    // This returned object gets attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
