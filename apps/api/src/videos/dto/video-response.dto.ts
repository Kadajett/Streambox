import { createZodDto } from 'nestjs-zod';
import { VideoResponseSchema, VideoUploadStatusResponseSchema } from '@streambox/shared-types';

export class VideoResponseDto extends createZodDto(VideoResponseSchema) {}

export class VideoUploadStatusResponseDto extends createZodDto(VideoUploadStatusResponseSchema) {}
