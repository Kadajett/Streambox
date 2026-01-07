import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { User } from '@streambox/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async register(
    dto: RegisterDto
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // 1. Check if user exists by email OR username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // 2. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create user in database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        displayName: dto.displayName || dto.username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        passwordHash: false,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. Generate JWT tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    if (!dto?.email || !dto?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      accessToken: token,
      refreshToken,
    };
  }

  async logout(userId: string) {
    // TODO: Implement token blacklisting with Redis if needed
    await Promise.resolve();
    return { message: 'Logged out successfully', userId };
  }

  private generateAccessToken(userId: string, email: string): string {
    const payload = { sub: userId, email, type: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
