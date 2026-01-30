import { Injectable } from '@nestjs/common';
import { prisma } from '@streambox/database';
import type { TranscodeJob, Prisma } from '@prisma/client';

@Injectable()
export class TranscodeJobRepository {
  async findById(id: string): Promise<TranscodeJob | null> {
    return prisma.transcodeJob.findUnique({ where: { id } });
  }

  async findLatestByVideoId(videoId: string): Promise<TranscodeJob | null> {
    return prisma.transcodeJob.findFirst({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVideoIds(videoIds: string[]): Promise<TranscodeJob[]> {
    return prisma.transcodeJob.findMany({
      where: { videoId: { in: videoIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.TranscodeJobCreateInput): Promise<TranscodeJob> {
    return prisma.transcodeJob.create({ data });
  }

  async update(id: string, data: Prisma.TranscodeJobUpdateInput): Promise<TranscodeJob> {
    return prisma.transcodeJob.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<TranscodeJob> {
    return prisma.transcodeJob.delete({ where: { id } });
  }
}
