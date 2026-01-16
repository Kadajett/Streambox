import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let app: INestApplication;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  };

  afterEach(async () => {
    await app?.close();
    jest.resetAllMocks();
  });

  it('POST /auth/register forwards to AuthService', async () => {
    authService.register.mockResolvedValue({ user: { id: 'u1' } });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'a@b.com', username: 'alice', password: 'pw' })
      .expect(201)
      .expect({ user: { id: 'u1' } });

    expect(authService.register).toHaveBeenCalledTimes(1);
  });

  it('POST /auth/login forwards to AuthService', async () => {
    authService.login.mockResolvedValue({ user: { id: 'u1' } });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'pw' })
      .expect(201)
      .expect({ user: { id: 'u1' } });

    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('POST /auth/refresh forwards to AuthService', async () => {
    authService.refresh.mockResolvedValue({ message: 'ok' });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/auth/refresh').expect(201).expect({ message: 'ok' });
    expect(authService.refresh).toHaveBeenCalledTimes(1);
  });

  it('GET /auth/me returns 401 when JwtAuthGuard rejects', async () => {
    const rejectingGuard: CanActivate = {
      canActivate(_ctx: ExecutionContext) {
        throw new UnauthorizedException('Invalid or expired token');
      },
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(rejectingGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me returns user profile when JwtAuthGuard allows', async () => {
    const allowingGuard: CanActivate = {
      canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: 'u1', email: 'a@b.com' };
        return true;
      },
    };

    authService.getCurrentUser.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowingGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(200)
      .expect({ id: 'u1', email: 'a@b.com' });

    expect(authService.getCurrentUser).toHaveBeenCalledWith('u1');
  });

  it('POST /auth/logout returns 401 when JwtAuthGuard rejects', async () => {
    const rejectingGuard: CanActivate = {
      canActivate(_ctx: ExecutionContext) {
        throw new UnauthorizedException('Invalid or expired token');
      },
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(rejectingGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post('/auth/logout').expect(401);
  });

  it('POST /auth/logout calls AuthService.logout with CurrentUser', async () => {
    const allowingGuard: CanActivate = {
      canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: 'u1', email: 'a@b.com' };
        return true;
      },
    };

    authService.logout.mockResolvedValue({ message: 'Logged out successfully', userId: 'u1' });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowingGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(201)
      .expect({ message: 'Logged out successfully', userId: 'u1' });

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(authService.logout.mock.calls[0][0]).toBe('u1');
  });
});
