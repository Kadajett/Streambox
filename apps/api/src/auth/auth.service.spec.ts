jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { TokenBlacklistService } from './token-blacklist.service';
import type { UserRepository } from '../database';

function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailOrUsername: jest.fn(),
    findByIdWithSelect: jest.fn(),
    create: jest.fn(),
    createWithSelect: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;
}

function createMockTokenBlacklistService(): jest.Mocked<TokenBlacklistService> {
  return {
    blacklist: jest.fn().mockResolvedValue(undefined),
    isBlacklisted: jest.fn().mockResolvedValue(false),
    blacklistAllForUser: jest.fn().mockResolvedValue(undefined),
    isUserTokenInvalidated: jest.fn().mockResolvedValue(false),
  } as unknown as jest.Mocked<TokenBlacklistService>;
}

function createMockResponse(cookies?: Record<string, string>): Response {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    req: {
      cookies: cookies ?? {},
    },
  } as unknown as Response;
}

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: Pick<JwtService, 'sign' | 'verify' | 'decode'>;
  let tokenBlacklist: jest.Mocked<TokenBlacklistService>;
  let userRepository: jest.Mocked<UserRepository>;
  let bcryptMock: { hash: jest.Mock; compare: jest.Mock };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    tokenBlacklist = createMockTokenBlacklistService();
    userRepository = createMockUserRepository();

    service = new AuthService(
      jwtService as JwtService,
      tokenBlacklist,
      userRepository as unknown as UserRepository
    );

    bcryptMock = bcrypt as unknown as typeof bcryptMock;
    bcryptMock.hash.mockReset();
    bcryptMock.compare.mockReset();
  });

  describe('register', () => {
    it('creates a user, sets cookies, returns user', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashed');

      userRepository.createWithSelect.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
        displayName: 'Alice',
        avatarUrl: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      } as any);

      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const response = createMockResponse();

      const result = await service.register(
        {
          email: 'a@b.com',
          username: 'alice',
          password: 'password123',
          displayName: 'Alice',
        },
        response
      );

      expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith('a@b.com', 'alice');
      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.createWithSelect).toHaveBeenCalled();

      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' })
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' })
      );

      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'u1',
          email: 'a@b.com',
          username: 'alice',
        }),
      });
    });

    it('throws ConflictException when email already registered', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'someone',
      } as User);

      await expect(
        service.register(
          { email: 'a@b.com', username: 'alice', password: 'pw' },
          createMockResponse()
        )
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws ConflictException when username already taken', async () => {
      userRepository.findByEmailOrUsername.mockResolvedValue({
        id: 'u1',
        email: 'someone@b.com',
        username: 'alice',
      } as User);

      await expect(
        service.register(
          { email: 'a@b.com', username: 'alice', password: 'pw' },
          createMockResponse()
        )
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('sets cookies and returns user without passwordHash', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
        passwordHash: 'hash',
      } as User);

      bcryptMock.compare.mockResolvedValue(true);

      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const response = createMockResponse();

      const result = await service.login({ email: 'a@b.com', password: 'pw' }, response);

      expect(bcryptMock.compare).toHaveBeenCalledWith('pw', 'hash');
      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result.user).toEqual(expect.objectContaining({ id: 'u1', email: 'a@b.com' }));
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'a@b.com', password: 'pw' }, createMockResponse())
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
        passwordHash: 'hash',
      } as User);
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@b.com', password: 'pw' }, createMockResponse())
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when refresh cookie missing', async () => {
      await expect(service.refresh(createMockResponse())).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues new tokens when refresh token is valid', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1', type: 'refresh' });
      userRepository.findById.mockResolvedValue({ id: 'u1', email: 'a@b.com' } as User);

      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');

      const response = createMockResponse({ refreshToken: 'rt' });
      const result = await service.refresh(response);

      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'new-access',
        expect.objectContaining({ httpOnly: true })
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result).toEqual({ message: 'Tokens refreshed successfully' });
    });

    it('throws UnauthorizedException when token type is not refresh', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'u1', type: 'access' });
      await expect(
        service.refresh(createMockResponse({ refreshToken: 'rt' }))
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when verify throws', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('bad');
      });

      await expect(
        service.refresh(createMockResponse({ refreshToken: 'rt' }))
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when found', async () => {
      userRepository.findByIdWithSelect.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        username: 'alice',
      } as any);

      await expect(service.getCurrentUser('u1')).resolves.toEqual(
        expect.objectContaining({ id: 'u1', email: 'a@b.com' })
      );
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepository.findByIdWithSelect.mockResolvedValue(null);
      await expect(service.getCurrentUser('u1')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears cookies and returns message', async () => {
      const response = createMockResponse();
      const result = await service.logout('u1', response);

      expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(response.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(result).toEqual({ message: 'Logged out successfully', userId: 'u1' });
    });
  });
});
