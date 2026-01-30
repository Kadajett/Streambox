import { Injectable } from '@nestjs/common';
import { FeedQueryDto } from './dto/feed-query.dto';
import type { Video } from '@prisma/client';
import { VideoRepository } from '../database';

@Injectable()
export class FeedService {
  constructor(private readonly videoRepository: VideoRepository) {}

  // public getFeed. Defaults to trending, but allows for subscription updates for authed users.
  async getFeed(
    query: FeedQueryDto,
    userId?: string
  ): Promise<{
    data: Video[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const [videos, total] = await Promise.all([
      this.videoRepository.findPublicVideos({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.videoRepository.countPublic(),
    ]);

    return {
      data: videos,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
