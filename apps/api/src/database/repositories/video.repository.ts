import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@streambox/database';
import type { Video, Prisma } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class VideoRepository {
  /**
   * Execute operations within a transaction
   * @param fn Function that receives a transaction client
   */
  async transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }

  /**
   * Create video within an existing transaction
   */
  async createInTransaction(
    tx: TransactionClient,
    data: Prisma.VideoCreateInput
  ): Promise<Video> {
    return tx.video.create({ data });
  }

  /**
   * Delete video within an existing transaction
   */
  async deleteInTransaction(tx: TransactionClient, id: string): Promise<Video> {
    return tx.video.delete({ where: { id } });
  }
  async findById(id: string): Promise<Video | null> {
    return prisma.video.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Video | null> {
    return prisma.video.findUnique({ where: { slug } });
  }

  async findByIdWithChannel(id: string) {
    return prisma.video.findUnique({
      where: { id },
      include: { channel: true },
    });
  }

  async findBySlugWithChannel(slug: string) {
    return prisma.video.findUnique({
      where: { slug },
      include: { channel: true },
    });
  }

  async findByIdOrSlugWithChannel(identifier: string) {
    // Try slug first, then ID
    let video = await prisma.video.findUnique({
      where: { slug: identifier },
      include: { channel: true },
    });

    if (!video) {
      video = await prisma.video.findUnique({
        where: { id: identifier },
        include: { channel: true },
      });
    }

    return video;
  }

  async findByChannelId(
    channelId: string,
    options?: {
      where?: Prisma.VideoWhereInput;
      skip?: number;
      take?: number;
      orderBy?: Prisma.VideoOrderByWithRelationInput;
    }
  ): Promise<Video[]> {
    return prisma.video.findMany({
      where: {
        channelId,
        ...options?.where,
      },
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  async findByChannelIdWithChannel(
    channelId: string,
    options?: {
      where?: Prisma.VideoWhereInput;
      skip?: number;
      take?: number;
      orderBy?: Prisma.VideoOrderByWithRelationInput;
    }
  ) {
    return prisma.video.findMany({
      where: {
        channelId,
        ...options?.where,
      },
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
      include: { channel: true },
    });
  }

  async findProcessingByChannel(channelId: string, userId: string): Promise<Video[]> {
    return prisma.video.findMany({
      where: {
        channel: {
          id: channelId,
          userId,
        },
        status: 'processing',
      },
    });
  }

  async findPublicVideos(options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.VideoOrderByWithRelationInput;
  }) {
    return prisma.video.findMany({
      where: {
        visibility: 'public',
        moderation: 'approved',
        status: 'ready',
      },
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
      include: { channel: true },
    });
  }

  async findPendingModeration(options?: { skip?: number; take?: number }) {
    return prisma.video.findMany({
      where: { moderation: 'pending' },
      orderBy: { createdAt: 'asc' },
      skip: options?.skip,
      take: options?.take,
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            handle: true,
          },
        },
      },
    });
  }

  async findWithoutSlug(): Promise<{ id: string; title: string }[]> {
    return prisma.video.findMany({
      where: { slug: undefined },
      select: { id: true, title: true },
    });
  }

  async findForAdminReview(id: string) {
    return prisma.video.findUnique({
      where: { id },
      include: {
        channel: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  async countByChannelId(channelId: string, where?: Prisma.VideoWhereInput): Promise<number> {
    return prisma.video.count({
      where: {
        channelId,
        ...where,
      },
    });
  }

  async countPublic(): Promise<number> {
    return prisma.video.count({
      where: {
        visibility: 'public',
        moderation: 'approved',
        status: 'ready',
      },
    });
  }

  async countPendingModeration(): Promise<number> {
    return prisma.video.count({ where: { moderation: 'pending' } });
  }

  async create(data: Prisma.VideoCreateInput): Promise<Video> {
    return prisma.video.create({ data });
  }

  async update(id: string, data: Prisma.VideoUpdateInput): Promise<Video> {
    return prisma.video.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Video> {
    return prisma.video.delete({ where: { id } });
  }

  async count(where?: Prisma.VideoWhereInput): Promise<number> {
    return prisma.video.count({ where });
  }
}
