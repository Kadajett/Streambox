import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
// biome-ignore lint/style/useImportType: NestJS validation requires runtime class reference
import { RegisterDto, LoginDto } from './dto';
// biome-ignore lint/style/useImportType: NestJS validation requires runtime class reference
import { CurrentUserDto } from './dto/current-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserDto) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: CurrentUserDto) {
    return this.authService.logout(user.id);
  }
}
