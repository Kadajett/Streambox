import { Controller, Post, Get, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto, LoginDto } from './dto';
import { CurrentUserDto } from './dto/current-user.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return await this.authService.register(dto, response);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return await this.authService.login(dto, response);
  }

  @Post('refresh')
  async refresh(@Res({ passthrough: true }) response: Response) {
    return await this.authService.refresh(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: CurrentUserDto) {
    return await this.authService.getCurrentUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: CurrentUserDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user.id, response);
  }
}
