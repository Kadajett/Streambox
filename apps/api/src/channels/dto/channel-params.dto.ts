import { ChannelHandleParamSchema, IdParamSchema } from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for channel handle URL parameter
 * Used for: GET /channels/:handle
 */
export class ChannelHandleParamDto extends createZodDto(ChannelHandleParamSchema) {}

/**
 * DTO for channel ID URL parameter
 * Used for: PATCH /channels/:id, DELETE /channels/:id
 */
export class ChannelIdParamDto extends createZodDto(IdParamSchema) {}
