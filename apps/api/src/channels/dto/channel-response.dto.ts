import {
  ChannelResponseSchema,
  ChannelSummarySchema,
  ChannelWithStatsSchema,
  ChannelsResponseSchema,
  ChannelsWithStatsSchema,
} from '@streambox/shared-types';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for a full channel with stats
 * Contains all channel data including subscriber/video counts
 *
 * Used for: GET /channels/:handle response, POST /channels response
 */
export class ChannelWithStatsDto extends createZodDto(ChannelWithStatsSchema) {}

/**
 * DTO for a lightweight channel summary
 * Used in lists and nested views where full data isn't needed
 *
 * Contains: id, name, handle, avatarUrl
 */
export class ChannelSummaryDto extends createZodDto(ChannelSummarySchema) {}

/**
 * DTO for an array of channels with stats
 * Used for: GET /channels/mine response
 */
export class ChannelsWithStatsDto extends createZodDto(ChannelsWithStatsSchema) {}

/**
 * DTO for single channel API response wrapper
 * Wraps channel data in a { data: ChannelWithStats } structure
 */
export class ChannelResponseDto extends createZodDto(ChannelResponseSchema) {}

/**
 * DTO for multiple channels API response wrapper
 * Wraps channel array in a { data: ChannelSummary[] } structure
 */
export class ChannelsResponseDto extends createZodDto(ChannelsResponseSchema) {}
