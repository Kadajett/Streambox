import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';

function createExecutionContext(request: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  let configService: Pick<ConfigService, 'get'>;
  let jwtService: Pick<JwtService, 'verifyAsync'>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };

    jwtService = {
      verifyAsync: jest.fn(),
    };
  });

  it('allows access via X-Admin-Key backdoor when it matches ADMIN_SECRET', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'ADMIN_SECRET') return 'secret';
      if (key === 'JWT_SECRET') return 'jwt-secret';
      return undefined;
    });

    const guard = new AdminGuard(configService as ConfigService, jwtService as JwtService);
    const req: any = { headers: { 'x-admin-key': 'secret' } };

    await expect(guard.canActivate(createExecutionContext(req))).resolves.toBe(true);
    expect(req.user).toEqual(
      expect.objectContaining({ role: 'admin', isBackdoor: true, sub: 'admin-backdoor' })
    );
  });

  it('throws UnauthorizedException when no Bearer token and no backdoor', async () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    const guard = new AdminGuard(configService as ConfigService, jwtService as JwtService);
    const req: any = { headers: {} };

    await expect(guard.canActivate(createExecutionContext(req))).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('allows access for admin JWT and injects payload as request.user', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'ADMIN_SECRET') return undefined;
      if (key === 'JWT_SECRET') return 'jwt-secret';
      return undefined;
    });

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'u1', role: 'admin' });

    const guard = new AdminGuard(configService as ConfigService, jwtService as JwtService);
    const req: any = { headers: { authorization: 'Bearer token' } };

    await expect(guard.canActivate(createExecutionContext(req))).resolves.toBe(true);
    expect(req.user).toEqual({ sub: 'u1', role: 'admin' });
  });

  it('throws ForbiddenException for non-admin JWT', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'ADMIN_SECRET') return undefined;
      if (key === 'JWT_SECRET') return 'jwt-secret';
      return undefined;
    });

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'u1', role: 'user' });

    const guard = new AdminGuard(configService as ConfigService, jwtService as JwtService);
    const req: any = { headers: { authorization: 'Bearer token' } };

    await expect(guard.canActivate(createExecutionContext(req))).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it('throws UnauthorizedException when JWT verification fails', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'ADMIN_SECRET') return undefined;
      if (key === 'JWT_SECRET') return 'jwt-secret';
      return undefined;
    });

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad token'));

    const guard = new AdminGuard(configService as ConfigService, jwtService as JwtService);
    const req: any = { headers: { authorization: 'Bearer token' } };

    await expect(guard.canActivate(createExecutionContext(req))).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
