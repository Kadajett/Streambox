import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TRANSCODE_QUEUE } from './videos.constants';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VIDEO_ERRORS, CHANNEL_ERRORS } from '@streambox/shared-types';
import type { Video } from '@streambox/shared-types';
import { CreateVideoDto } from './dto';

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
      throw CHANNEL_ERRORS.CHANNEL_NOT_FOUND;
    }

    if (channel.userId !== userId) {
      throw CHANNEL_ERRORS.NOT_CHANNEL_OWNER;
    }

    const video = await this.prismaService.video.create({
      data: {
        title: dto.title,
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
}
