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
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { VideosService } from './videos.service';
import { StorageService } from 'src/storage/storage.service';
import {
  CreateVideoDto,
  UpdateVideoDto,
  VideoIdParamDto,
  ChannelIdParamDto,
  ChannelVideosQueryDto,
  VideoTranscodingStatusResponseDto,
} from './dto';
import { CurrentUser, CurrentUserDto, JwtAuthGuard, type CurrentUserPayload } from 'src/auth';
import { VIDEO_ERRORS, VideoUploadStatusResponse } from '@streambox/shared-types';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
          const storagePath = process.env.STORAGE_PATH;
          if (!storagePath) {
            return cb(new Error('STORAGE_PATH environment variable is not set'), '');
          }
          // We'll use a temp dir initially, then move via service
          cb(null, join(storagePath, 'raw'));
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

    console.log(
      'Video Controller',
      'uploadVideo called with file:',
      file.originalname,
      file.filename,
      'for channel:',
      params.channelId
    );

    const video = await this.videosService.create(dto, params.channelId, user.id, file.filename);

    return { data: video };
  }

  @Get('videos/:id/transcoding-status')
  @UseGuards(JwtAuthGuard)
  async checkFileTranscodingStatus(
    @CurrentUser() user: CurrentUserDto,
    @Param() params: VideoIdParamDto
  ): Promise<VideoUploadStatusResponse> {
    return await this.videosService.getStatus(params.id, user.id);
  }

  @Get('videos/in-progress-files')
  @UseGuards(JwtAuthGuard)
  async getInProgressFilesForChannel(
    @CurrentUser() user: CurrentUserDto,
    @Query() query: ChannelIdParamDto
  ): Promise<VideoUploadStatusResponse[]> {
    return await this.videosService.getInProgressFilesForChannel(query.channelId, user.id);
  }

  /**
   * Get a single video by ID
   * GET /videos/:id
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('videos/:id')
  async findById(@Param() params: VideoIdParamDto, @CurrentUser() user?: CurrentUserPayload) {
    const video = await this.videosService.findById(params.id, user?.id ?? '');
    return { data: video };
  }

  /**
   * Get all videos for a channel (paginated)
   * GET /channels/:channelId/videos
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('channels/:channelId/videos')
  async findByChannel(
    @Param() params: ChannelIdParamDto,
    @Query() query: ChannelVideosQueryDto,
    @CurrentUser() user?: CurrentUserPayload
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
   * Get all videos for owner of the channel (includes non-public videos)
   * GET /channels/:channelId/videos/all
   */
  @UseGuards(JwtAuthGuard)
  @Get('channels/:channelId/videos/all')
  async findAllByOwnerChannel(
    @Param() params: ChannelIdParamDto,
    @Query() query: ChannelVideosQueryDto,
    @CurrentUser() user: CurrentUserDto
  ) {
    const result = await this.videosService.findAllByOwnerChannel(params.channelId, user.id, {
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
