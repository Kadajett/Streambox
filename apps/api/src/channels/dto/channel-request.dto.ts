import { CreateChannelRequestSchema, UpdateChannelRequestSchema } from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for creating a new channel
 * Used for: POST /channels
 *
 * @property name - Channel display name (1-100 chars)
 * @property handle - Unique channel handle (3-30 chars, alphanumeric with _ and -)
 * @property description - Optional channel description (max 500 chars)
 */
export class CreateChannelDto extends createZodDto(CreateChannelRequestSchema) {}

/**
 * DTO for updating an existing channel
 * Used for: PATCH /channels/:id
 *
 * All fields are optional - only provided fields will be updated
 * @property name - New channel display name
 * @property description - New channel description
 * @property bannerUrl - New banner image URL
 * @property avatarUrl - New avatar image URL
 */
export class UpdateChannelDto extends createZodDto(UpdateChannelRequestSchema) {}
