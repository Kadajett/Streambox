import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { VideosService } from './videos.service';
import { StorageService } from 'src/storage/storage.service';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoIdParamDto,
  ChannelIdParamDto,
  ChannelVideosQueryDto,
} from './dto';
import { CurrentUser, CurrentUserDto, JwtAuthGuard } from 'src/auth';
import { VIDEO_ERRORS } from '@streambox/shared-types';

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Max file size: 2GB
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

@Controller()
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly storageService: StorageService
  ) {}

  /**
   * Upload a new video to a channel
   * POST /channels/:channelId/videos
   */
  @Post('channels/:channelId/videos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          // We'll use a temp dir initially, then move via service
          cb(null, './data/raw');
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = randomUUID();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(VIDEO_ERRORS.INVALID_VIDEO_FILE), false);
        }
      },
    })
  )
  async uploadVideo(
    @CurrentUser() user: CurrentUserDto,
    @Param() params: ChannelIdParamDto,
    @Body() dto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException(VIDEO_ERRORS.INVALID_VIDEO_FILE);
    }

    const video = await this.videosService.create(dto, params.channelId, user.id, file.filename);

    return { data: video };
  }

  /**
   * Get a single video by ID
   * GET /videos/:id
   */
  @Get('videos/:id')
  async findById(@Param() params: VideoIdParamDto, @CurrentUser() user?: CurrentUserDto) {
    const video = await this.videosService.findById(params.id, user?.id ?? '');
    return { data: video };
  }

  /**
   * Get all videos for a channel (paginated)
   * GET /channels/:channelId/videos
   */
  @Get('channels/:channelId/videos')
  async findByChannel(
    @Param() params: ChannelIdParamDto,
    @Query() query: ChannelVideosQueryDto,
    @CurrentUser() user?: CurrentUserDto
  ) {
    const result = await this.videosService.findByChannel(params.channelId, user?.id ?? '', {
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      data: result.videos,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Update video metadata
   * PATCH /videos/:id
   */
  @Patch('videos/:id')
  @UseGuards(JwtAuthGuard)
  async updateVideo(
    @CurrentUser() user: CurrentUserDto,
    @Param() params: VideoIdParamDto,
    @Body() dto: UpdateVideoDto
  ) {
    const video = await this.videosService.update(params.id, dto, user.id);
    return { data: video };
  }

  /**
   * Delete a video
   * DELETE /videos/:id
   */
  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard)
  async deleteVideo(@CurrentUser() user: CurrentUserDto, @Param() params: VideoIdParamDto) {
    await this.videosService.delete(params.id, user.id);
    return { message: 'Video deleted successfully' };
  }

  /**
   * Get video upload/processing status
   * GET /videos/:id/status
   */
  @Get('videos/:id/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@CurrentUser() user: CurrentUserDto, @Param() params: VideoIdParamDto) {
    const status = await this.videosService.getStatus(params.id, user.id);
    return { data: status };
  }
}
