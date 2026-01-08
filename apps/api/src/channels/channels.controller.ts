import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { ChannelsService } from './channels.service';
// biome-ignore lint/style/useImportType: NestJS validation requires runtime class reference
import {
  ChannelHandleParamDto,
  ChannelIdParamDto,
  ChannelsWithStatsDto,
  CreateChannelDto,
  UpdateChannelDto,
} from './dto';
import { CurrentUser, CurrentUserDto, JwtAuthGuard } from 'src/auth';
import { ZodResponse } from 'nestjs-zod';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createChannel(@CurrentUser() user: CurrentUserDto, @Body() dto: CreateChannelDto) {
    return this.channelsService.createChannel(dto, user.id);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMyChannel(@CurrentUser() user: CurrentUserDto) {
    return this.channelsService.findAllByUserId(user.id);
  }

  @Get(':handle')
  async findByHandle(@Param() dto: ChannelHandleParamDto) {
    console.log('Fetching channel with handle:', dto);
    return this.channelsService.findByHandle(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateChannel(
    @CurrentUser() user: CurrentUserDto,
    @Param() params: ChannelIdParamDto,
    @Body() dto: UpdateChannelDto
  ) {
    console.log('Updating channel with ID:', params.id, 'with data:', dto);
    return this.channelsService.updateChannel(params.id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteChannel(@CurrentUser() user: CurrentUserDto, @Param() params: ChannelIdParamDto) {
    return this.channelsService.deleteChannel(params.id, user.id);
  }
}
