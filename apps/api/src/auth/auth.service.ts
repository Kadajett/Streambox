import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserRepository } from '../database';

const TOKEN_EXPIRATION = { access: 15 * 60 * 1000, refresh: 7 * 24 * 60 * 60 * 1000 };
const TOKEN_EXPIRATION_SECONDS = { access: 15 * 60, refresh: 7 * 24 * 60 * 60 };

// Select fields for user responses (excludes passwordHash)
const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  passwordHash: false,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly userRepository: UserRepository
  ) {}

  async register(
    dto: RegisterDto,
    response: Response
  ): Promise<{ user: Omit<User, 'passwordHash'> }> {
    // 1. Check if user exists by email OR username
    const existingUser = await this.userRepository.findByEmailOrUsername(dto.email, dto.username);

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // 2. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create user in database
    const user = await this.userRepository.createWithSelect(
      {
        email: dto.email,
        username: dto.username,
        passwordHash,
        displayName: dto.displayName || dto.username,
      },
      USER_SELECT
    );

    // 4. Generate JWT tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION.refresh, // 7 days
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION.access, // 15 minutes
    });

    return {
      user,
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findByIdWithSelect(userId, USER_SELECT);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async refresh(response: Response) {
    const refreshToken = response.req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.generateAccessToken(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id);

      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRATION.refresh, // 7 days
      });

      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRATION.access, // 15 minutes
      });

      return { message: 'Tokens refreshed successfully' };
    } catch (_error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(dto: LoginDto, response: Response): Promise<{ user: Omit<User, 'passwordHash'> }> {
    if (!dto?.email || !dto?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION.refresh, // 7 days
    });

    response.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION.access, // 15 minutes
    });

    // Exclude passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  async logout(userId: string, response: Response) {
    // Get current tokens to blacklist them
    const accessToken = response.req.cookies.accessToken;
    const refreshToken = response.req.cookies.refreshToken;

    // Blacklist both tokens if present
    if (accessToken) {
      try {
        const payload = this.jwtService.decode(accessToken) as { jti?: string; exp?: number };
        if (payload?.jti && payload?.exp) {
          await this.tokenBlacklist.blacklist(payload.jti, payload.exp);
        }
      } catch {
        // Token might be invalid, ignore
      }
    }

    if (refreshToken) {
      try {
        const payload = this.jwtService.decode(refreshToken) as { jti?: string; exp?: number };
        if (payload?.jti && payload?.exp) {
          await this.tokenBlacklist.blacklist(payload.jti, payload.exp);
        }
      } catch {
        // Token might be invalid, ignore
      }
    }

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return { message: 'Logged out successfully', userId };
  }

  /**
   * Logout from all devices by invalidating all tokens for a user
   */
  async logoutAll(userId: string, response: Response) {
    await this.tokenBlacklist.blacklistAllForUser(userId, TOKEN_EXPIRATION_SECONDS.refresh);

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return { message: 'Logged out from all devices', userId };
  }

  private generateAccessToken(userId: string, email: string): string {
    const jti = randomUUID();
    const payload = { sub: userId, email, type: 'access', jti };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const jti = randomUUID();
    const payload = { sub: userId, type: 'refresh', jti };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
