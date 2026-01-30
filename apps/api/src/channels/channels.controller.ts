import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime reference
import { ChannelsService } from './channels.service';
// biome-ignore lint/style/useImportType: NestJS validation requires runtime class reference
import {
  ChannelHandleParamDto,
  ChannelIdParamDto,
  CreateChannelDto,
  UpdateChannelDto,
} from './dto';
import { CurrentUser, CurrentUserDto, JwtAuthGuard } from 'src/auth';

@Controller('channels')
export class ChannelsController {
  private readonly logger = new Logger(ChannelsController.name);

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
    this.logger.debug(`Fetching channel with handle: ${dto.handle}`);
    return this.channelsService.findByHandle(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateChannel(
    @CurrentUser() user: CurrentUserDto,
    @Param() params: ChannelIdParamDto,
    @Body() dto: UpdateChannelDto
  ) {
    this.logger.debug(`Updating channel ${params.id}`);
    return this.channelsService.updateChannel(params.id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteChannel(@CurrentUser() user: CurrentUserDto, @Param() params: ChannelIdParamDto) {
    return this.channelsService.deleteChannel(params.id, user.id);
  }
}
