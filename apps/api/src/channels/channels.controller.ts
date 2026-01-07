import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { ChannelsService } from './channels.service';
// biome-ignore lint/style/useImportType: NestJS validation requires runtime class reference
import {
  ChannelHandleParamDto,
  ChannelIdParamDto,
  CreateChannelDto,
  UpdateChannelDto,
} from './dto';
import { CurrentUser, JwtAuthGuard } from 'src/auth';
import type { UserDto } from '@streambox/shared-types';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createChannel(@CurrentUser() user: UserDto, @Body() dto: CreateChannelDto) {
    return this.channelsService.createChannel(dto, user.id);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMyChannel(@CurrentUser() user: UserDto) {
    return this.channelsService.findAllByUserId(user?.id);
  }

  @Get(':handle')
  async findByHandle(@Param() dto: ChannelHandleParamDto) {
    console.log('Fetching channel with handle:', dto);
    return this.channelsService.findByHandle(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateChannel(
    @CurrentUser() user: UserDto,
    @Param() params: ChannelIdParamDto,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.channelsService.updateChannel(params.id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteChannel(@CurrentUser() user: UserDto, @Param() params: ChannelIdParamDto) {
    return this.channelsService.deleteChannel(params.id, user.id);
  }
}
