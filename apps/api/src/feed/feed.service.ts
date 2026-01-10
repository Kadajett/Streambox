import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeedQueryDto } from './dto/feed-query.dto';
import { Video } from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private prismaService: PrismaService) {}

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

    const videos = await this.prismaService.video.findMany({
      where: {
        visibility: 'public',
        status: 'ready',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        channel: true,
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const total = await this.prismaService.video.count({
      where: {
        visibility: 'public',
        status: 'ready',
      },
    });

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
