import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema, ChannelVideosQuerySchema } from '@streambox/shared-types';

const VideoIdParamSchema = z.object({
  id: z.cuid(),
});

const ChannelIdParamSchema = z.object({
  channelId: z.cuid(),
});

export class VideoIdParamDto extends createZodDto(VideoIdParamSchema) {}

export class ChannelIdParamDto extends createZodDto(ChannelIdParamSchema) {}

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export class ChannelVideosQueryDto extends createZodDto(ChannelVideosQuerySchema) {}
