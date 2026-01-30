import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { CreateChannelDto, UpdateChannelDto, ChannelHandleParamDto } from './dto';
import type { Channel } from '@prisma/client';
import { CHANNEL_ERRORS, CHANNEL_USER_CHANNEL_LIMIT } from '@streambox/shared-types';
import { ChannelRepository } from '../database';

// Local type for channel with computed stats
type ChannelWithStats = Channel & {
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
};

@Injectable()
export class ChannelsService {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async createChannel(dto: CreateChannelDto, userId: string): Promise<Channel> {
    // Check if user has reached channel limit
    const userChannelCount = await this.channelRepository.countByUserId(userId);
    if (userChannelCount >= CHANNEL_USER_CHANNEL_LIMIT) {
      throw new ForbiddenException(
        `You can only create up to ${CHANNEL_USER_CHANNEL_LIMIT} channels`
      );
    }

    // Check if channel handle already exists
    const existingChannel = await this.channelRepository.findByHandle(dto.handle);
    if (existingChannel) {
      throw new ConflictException('Channel handle already taken');
    }

    // Create the channel
    const channel = await this.channelRepository.create({
      handle: dto.handle,
      name: dto.name,
      description: dto.description,
      user: { connect: { id: userId } },
    });

    return channel;
  }

  async findAllByUserId(userId: string): Promise<ChannelWithStats[]> {
    const channels = await this.channelRepository.findByUserIdWithStats(userId);

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
    const channel = await this.channelRepository.findByHandleWithStats(dto.handle);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const totalViews = await this.channelRepository.aggregateVideoViews(channel.id);

    return {
      ...channel,
      totalViews,
      videoCount: channel._count.videos,
      subscriberCount: channel._count.subscribers,
    };
  }

  async updateChannel(channelId: string, dto: UpdateChannelDto, userId: string): Promise<Channel> {
    const channel = await this.channelRepository.findById(channelId);
    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }
    if (channel.userId !== userId) {
      throw new ForbiddenException(CHANNEL_ERRORS.NOT_CHANNEL_OWNER);
    }

    const updatedChannel = await this.channelRepository.update(channelId, dto);

    return updatedChannel;
  }

  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const channel = await this.channelRepository.findByIdAndUserId(channelId, userId);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    await this.channelRepository.deleteByIdAndUserId(channelId, userId);
  }

  async updateAvatar(channelId: string, userId: string, avatarUrl: string): Promise<Channel> {
    if (!avatarUrl) {
      throw new BadRequestException();
    }

    const channel = await this.channelRepository.findByIdAndUserId(channelId, userId);

    if (!channel) {
      throw new NotFoundException(CHANNEL_ERRORS.CHANNEL_NOT_FOUND);
    }

    const updatedChannel = await this.channelRepository.updateByIdAndUserId(channelId, userId, {
      avatarUrl,
    });

    return updatedChannel;
  }
}
