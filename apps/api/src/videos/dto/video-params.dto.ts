import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema, ChannelVideosQuerySchema } from '@streambox/shared-types';

const VideoIdParamSchema = z.object({
  id: z.string().min(1, 'Video ID is required'),
});

const ChannelIdParamSchema = z.object({
  channelId: z.string().min(1, 'Channel ID is required'),
});

export class VideoIdParamDto extends createZodDto(VideoIdParamSchema) {}

export class ChannelIdParamDto extends createZodDto(ChannelIdParamSchema) {}

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export class ChannelVideosQueryDto extends createZodDto(ChannelVideosQuerySchema) {}
