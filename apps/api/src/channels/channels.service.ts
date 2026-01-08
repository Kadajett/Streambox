import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { CreateChannelDto, UpdateChannelDto, ChannelHandleParamDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Channel } from '@prisma/client';
import { CHANNEL_ERRORS, CHANNEL_USER_CHANNEL_LIMIT } from '@streambox/shared-types';

// Local type for channel with computed stats
type ChannelWithStats = Channel & {
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
};

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async createChannel(dto: CreateChannelDto, userId: string): Promise<Channel> {
    // Check if user has reached channel limit
    const userChannelCount = await this.prisma.channel.count({
      where: { user: { id: userId } },
    });
    if (userChannelCount >= CHANNEL_USER_CHANNEL_LIMIT) {
      throw new ForbiddenException(
        `You can only create up to ${CHANNEL_USER_CHANNEL_LIMIT} channels`
      );
    }

    // Check if channel handle already exists
    const existingChannel = await this.prisma.channel.findUnique({
      where: { handle: dto.handle },
    });
    if (existingChannel) {
      throw new ConflictException('Channel handle already taken');
    }

    // Create the channel
    const channel = await this.prisma.channel.create({
      data: {
        handle: dto.handle,
        name: dto.name,
        description: dto.description,
        user: { connect: { id: userId } },
      },
    });

    return channel;
  }

  async findAllByUserId(userId: string): Promise<ChannelWithStats[]> {
    const channels = await this.prisma.channel.findMany({
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

    if (!channels || channels.length === 0) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    // Map each channel to include computed stats
    return channels.map(({ _count, videos, ...channel }) => ({
      ...channel,
      subscriberCount: _count.subscribers,
      videoCount: _count.videos,
      totalViews: videos.reduce((sum, video) => sum + video.viewCount, 0),
    }));
  }

  async findByHandle(dto: ChannelHandleParamDto): Promise<ChannelWithStats> {
    const channel = await this.prisma.channel.findUnique({
      where: { handle: dto.handle },
      include: {
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const totalViews = await this.prisma.video.aggregate({
      where: {
        channelId: channel.id,
      },
      _sum: { viewCount: true },
    });

    return {
      ...channel,
      totalViews: totalViews._sum.viewCount || 0,
      videoCount: channel._count.videos,
      subscriberCount: channel._count.subscribers,
    };
  }

  async updateChannel(channelId: string, dto: UpdateChannelDto, userId: string): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }
    if (channel.userId !== userId) {
      throw new ForbiddenException(CHANNEL_ERRORS.NOT_CHANNEL_OWNER);
    }

    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        ...dto,
      },
    });

    return updatedChannel;
  }

  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId, userId },
    });

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    await this.prisma.channel.delete({
      where: { id: channelId, userId },
    });
  }

  async updateAvatar(channelId: string, userId: string, avatarUrl: string): Promise<Channel> {
    if (!avatarUrl) {
      throw new BadRequestException();
    }

    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId, userId },
    });

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const updatedChannel = await this.prisma.channel.update({
      where: { id: channelId, userId },
      data: {
        avatarUrl,
      },
    });

    return updatedChannel;
  }
}
