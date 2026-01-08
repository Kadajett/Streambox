import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VideoIdParamSchema = z.object({
  id: z.cuid(),
});

const ChannelIdParamSchema = z.object({
  channelId: z.cuid(),
});

export class VideoIdParamDto extends createZodDto(VideoIdParamSchema) {}

export class ChannelIdParamDto extends createZodDto(ChannelIdParamSchema) {}
