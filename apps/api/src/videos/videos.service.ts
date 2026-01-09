import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TRANSCODE_QUEUE } from './videos.constants';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VIDEO_ERRORS, CHANNEL_ERRORS } from '@streambox/shared-types';
import type { Video } from '@prisma/client';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { generateSlug, generateUniqueSlug } from 'src/utils/slug';

@Injectable()
export class VideosService {
  constructor(
    @InjectQueue(TRANSCODE_QUEUE) private transcodeQueue: Queue,
    private storage: StorageService,
    private prismaService: PrismaService
  ) {}

  async create(
    dto: CreateVideoDto,
    channelId: string,
    userId: string,
    filename: string
  ): Promise<Video> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException(CHANNEL_ERRORS.NOT_CHANNEL_OWNER);
    }

    // Generate unique slug from title
    const baseSlug = generateSlug(dto.title);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await this.prismaService.video.findUnique({ where: { slug: s } });
      return existing !== null;
    });

    const video = await this.prismaService.video.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description ?? null,
        channelId: channel.id,
        // @TODO: Generate actual URL later. filepath for local dev.
        videoUrl: filename,
        visibility: dto.visibility ?? 'private',
        status: 'processing',
      },
    });

    await this.transcodeQueue.add(TRANSCODE_QUEUE, {
      videoId: video.id,
      inputPath: this.storage.getRawPath(video.id, filename),
      outputDir: this.storage.getHlsDir(video.id),
    });

    return video;
  }

  /**
   * Find a video by slug or ID
   * Tries slug first, then falls back to ID lookup
   */
  async findByIdOrSlug(identifier: string, userId: string): Promise<Video> {
    if (!identifier) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    // Try to find by slug first, then by id
    let video = await this.prismaService.video.findUnique({
      where: { slug: identifier },
      include: { channel: true },
    });

    if (!video) {
      video = await this.prismaService.video.findUnique({
        where: { id: identifier },
        include: { channel: true },
      });
    }

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    // status checks
    if (video.status !== 'ready' && video.channel.userId !== userId) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }
    if (video.status === 'failed') {
      throw new BadRequestException(VIDEO_ERRORS.VIDEO_FAILED);
    }

    // moderation check. Only owner can access if not approved
    if (video.moderation !== 'approved' && video.channel.userId !== userId) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    // visibility check
    if (video.visibility === 'private' && video.channel.userId !== userId) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    return video;
  }

  // Alias for backwards compatibility
  async findById(videoId: string, userId: string): Promise<Video> {
    return this.findByIdOrSlug(videoId, userId);
  }

  async findByChannel(
    channelId: string,
    userId: string,
    options?: { page?: number; pageSize?: number }
  ): Promise<{
    videos: Video[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = options?.page ?? 1;
    const pageSize = Math.min(options?.pageSize ?? 20, 100); // Cap at 100
    const skip = (page - 1) * pageSize;

    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const isOwner = channel.userId === userId;

    const whereClause = {
      channelId: channel.id,
      AND: isOwner
        ? {}
        : {
            status: 'ready' as const,
            moderation: 'approved' as const,
            NOT: {
              visibility: 'private' as const,
            },
          },
    };

    const [videos, total] = await Promise.all([
      this.prismaService.video.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prismaService.video.count({
        where: whereClause,
      }),
    ]);

    return {
      videos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async update(videoId: string, data: UpdateVideoDto, userId: string): Promise<Video> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        channel: true,
      },
    });

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    const updatedVideo = await this.prismaService.video.update({
      where: { id: video.id },
      data,
    });

    return updatedVideo;
  }

  async delete(videoId: string, userId: string): Promise<void> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        channel: true,
      },
    });

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    await this.prismaService.video.delete({
      where: { id: video.id },
    });

    // Delete associated files
    await this.storage.deleteVideoFiles(video.id);

    return;
  }

  async getStatus(
    videoId: string,
    userId: string
  ): Promise<{ status: string; progress: number; error?: string }> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        channel: true,
      },
    });

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    const transcodeJob = await this.prismaService.transcodeJob.findFirst({
      where: {
        videoId: videoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: video.status,
      progress: transcodeJob?.progress ?? 0,
      ...(transcodeJob?.error && { error: transcodeJob.error }),
    };
  }
}
