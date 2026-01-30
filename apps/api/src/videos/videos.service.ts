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
import { VIDEO_ERRORS, CHANNEL_ERRORS, VideoUploadStatusResponse } from '@streambox/shared-types';
import type { Video } from '@prisma/client';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { generateSlug, generateUniqueSlug } from 'src/utils/slug';
import { ChannelRepository, VideoRepository, TranscodeJobRepository } from '../database';

@Injectable()
export class VideosService {
  constructor(
    @InjectQueue(TRANSCODE_QUEUE) private transcodeQueue: Queue,
    private storage: StorageService,
    private readonly channelRepository: ChannelRepository,
    private readonly videoRepository: VideoRepository,
    private readonly transcodeJobRepository: TranscodeJobRepository
  ) {}

  async create(
    dto: CreateVideoDto,
    channelId: string,
    userId: string,
    filename: string
  ): Promise<Video> {
    const channel = await this.channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException(CHANNEL_ERRORS.NOT_CHANNEL_OWNER);
    }

    // Generate unique slug from title
    const baseSlug = generateSlug(dto.title);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await this.videoRepository.findBySlug(s);
      return existing !== null;
    });

    const video = await this.videoRepository.create({
      title: dto.title,
      slug,
      description: dto.description ?? null,
      channel: { connect: { id: channel.id } },
      videoUrl: filename,
      visibility: dto.visibility ?? 'private',
      status: 'processing',
    });

    try {
      await this.transcodeQueue.add(TRANSCODE_QUEUE, {
        videoId: video.id,
        inputPath: this.storage.getRawPath(video.id, filename),
        outputDir: this.storage.getHlsDir(video.id),
      });
    } catch (error) {
      // Compensating action: delete the video record if queue job fails
      await this.videoRepository.delete(video.id);
      throw new BadRequestException('Failed to queue video for processing');
    }

    return video;
  }

  /**
   * get all videos for channel for owner (includes non-public)
   */
  async findAllByOwnerChannel(
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

    const channel = await this.channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    if (channel.userId !== userId) {
      throw new ForbiddenException(CHANNEL_ERRORS.NOT_CHANNEL_OWNER);
    }

    const [videos, total] = await Promise.all([
      this.videoRepository.findByChannelId(channel.id, { skip, take: pageSize }),
      this.videoRepository.countByChannelId(channel.id),
    ]);

    return {
      videos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Find a video by slug or ID
   * Tries slug first, then falls back to ID lookup
   */
  async findByIdOrSlug(identifier: string, userId: string): Promise<Video> {
    if (!identifier) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    const video = await this.videoRepository.findByIdOrSlugWithChannel(identifier);

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

    const channel = await this.channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const isOwner = channel.userId === userId;

    const whereClause = isOwner
      ? {}
      : {
          status: 'ready' as const,
          moderation: 'approved' as const,
          NOT: {
            visibility: 'private' as const,
          },
        };

    const [videos, total] = await Promise.all([
      this.videoRepository.findByChannelId(channel.id, {
        where: whereClause,
        skip,
        take: pageSize,
      }),
      this.videoRepository.countByChannelId(channel.id, whereClause),
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
    const video = await this.videoRepository.findByIdWithChannel(videoId);

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    const updatedVideo = await this.videoRepository.update(video.id, data);

    return updatedVideo;
  }

  async delete(videoId: string, userId: string): Promise<void> {
    const video = await this.videoRepository.findByIdWithChannel(videoId);

    if (!video || !video.videoUrl) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    // Delete database record first (this is the authoritative state)
    await this.videoRepository.delete(video.id);

    // Delete associated files - fire-and-forget with error handling
    // Orphaned files can be cleaned up later by a maintenance job
    try {
      await this.storage.deleteVideoFiles(video.id, video.videoUrl);
    } catch {
      // Log failure but don't fail the operation
      // Orphaned files are preferable to orphaned DB records
    }
  }

  async getStatus(videoId: string, userId: string): Promise<VideoUploadStatusResponse> {
    const video = await this.videoRepository.findByIdWithChannel(videoId);

    if (!video) {
      throw new NotFoundException(VIDEO_ERRORS.VIDEO_NOT_FOUND);
    }

    if (video.channel.userId !== userId) {
      throw new ForbiddenException(VIDEO_ERRORS.NOT_VIDEO_OWNER);
    }

    const transcodeJob = await this.transcodeJobRepository.findLatestByVideoId(videoId);

    return {
      status: video.status,
      progress: transcodeJob?.progress ?? 0,
      ...(transcodeJob?.error && { error: transcodeJob.error }),
    };
  }

  async getInProgressFilesForChannel(
    channelId: string,
    userId: string
  ): Promise<VideoUploadStatusResponse[]> {
    const videos = await this.videoRepository.findProcessingByChannel(channelId, userId);

    if (videos.length === 0) {
      return [];
    }

    // Batch query: get all transcodeJobs for these videos in one query
    const videoIds = videos.map((v) => v.id);
    const transcodeJobs = await this.transcodeJobRepository.findByVideoIds(videoIds);

    // Create a map of videoId -> most recent transcodeJob
    // Since results are ordered by createdAt desc, the first job for each video is the most recent
    const jobByVideoId = new Map<string, (typeof transcodeJobs)[0]>();
    for (const job of transcodeJobs) {
      if (!jobByVideoId.has(job.videoId)) {
        jobByVideoId.set(job.videoId, job);
      }
    }

    // Map videos to their status responses
    return videos.map((video) => {
      const transcodeJob = jobByVideoId.get(video.id);
      return {
        status: video.status,
        progress: transcodeJob?.progress ?? 0,
        ...(transcodeJob?.error && { error: transcodeJob.error }),
      };
    });
  }
}
