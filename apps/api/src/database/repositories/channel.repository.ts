import { Injectable } from '@nestjs/common';
import { prisma } from '@streambox/database';
import type { Channel, Prisma } from '@prisma/client';

@Injectable()
export class ChannelRepository {
  async findById(id: string): Promise<Channel | null> {
    return prisma.channel.findUnique({ where: { id } });
  }

  async findByHandle(handle: string): Promise<Channel | null> {
    return prisma.channel.findUnique({ where: { handle } });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { id, userId },
    });
  }

  async findByUserId(userId: string): Promise<Channel[]> {
    return prisma.channel.findMany({ where: { userId } });
  }

  async findByUserIdWithStats(userId: string) {
    return prisma.channel.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
        videos: {
          select: {
            viewCount: true,
          },
        },
      },
    });
  }

  async findByHandleWithStats(handle: string) {
    return prisma.channel.findUnique({
      where: { handle },
      include: {
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
      },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.channel.count({
      where: { user: { id: userId } },
    });
  }

  async create(data: Prisma.ChannelCreateInput): Promise<Channel> {
    return prisma.channel.create({ data });
  }

  async update(id: string, data: Prisma.ChannelUpdateInput): Promise<Channel> {
    return prisma.channel.update({
      where: { id },
      data,
    });
  }

  async updateByIdAndUserId(
    id: string,
    userId: string,
    data: Prisma.ChannelUpdateInput
  ): Promise<Channel> {
    return prisma.channel.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string): Promise<Channel> {
    return prisma.channel.delete({ where: { id } });
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<Channel> {
    return prisma.channel.delete({
      where: { id, userId },
    });
  }

  async aggregateVideoViews(channelId: string): Promise<number> {
    const result = await prisma.video.aggregate({
      where: { channelId },
      _sum: { viewCount: true },
    });
    return result._sum.viewCount || 0;
  }

  async count(where?: Prisma.ChannelWhereInput): Promise<number> {
    return prisma.channel.count({ where });
  }
}
