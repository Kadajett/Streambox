import { z } from 'zod';
import { TimestampsSchema } from './common';

// ============================================
// Channel Schemas
// ============================================

// Validation constants
export const CHANNEL_NAME_MIN = 1;
export const CHANNEL_NAME_MAX = 100;
export const CHANNEL_HANDLE_MIN = 3;
export const CHANNEL_HANDLE_MAX = 30;
export const CHANNEL_HANDLE_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const CHANNEL_DESCRIPTION_MAX = 500;
export const CHANNEL_USER_CHANNEL_LIMIT = 5;

// Base channel fields
export const ChannelBaseSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(CHANNEL_NAME_MIN, 'Channel name is required')
    .max(CHANNEL_NAME_MAX, `Channel name must be at most ${CHANNEL_NAME_MAX} characters`),
  handle: z
    .string()
    .min(CHANNEL_HANDLE_MIN, `Handle must be at least ${CHANNEL_HANDLE_MIN} characters`)
    .max(CHANNEL_HANDLE_MAX, `Handle must be at most ${CHANNEL_HANDLE_MAX} characters`)
    .regex(
      CHANNEL_HANDLE_PATTERN,
      'Handle can only contain letters, numbers, underscores, and hyphens'
    ),
  description: z.string().max(CHANNEL_DESCRIPTION_MAX).nullable(),
  bannerUrl: z.string().url().nullable(),
  avatarUrl: z.string().url().nullable(),
  userId: z.string().cuid(),
});

// Full channel entity
export const ChannelSchema = ChannelBaseSchema.merge(TimestampsSchema);
export type Channel = z.infer<typeof ChannelSchema>;

// Channel with stats (for display)
export const ChannelWithStatsSchema = ChannelSchema.extend({
  subscriberCount: z.number().int().nonnegative(),
  videoCount: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
});
export type ChannelWithStats = z.infer<typeof ChannelWithStatsSchema>;

// Multiple channels with stats (for user's channels list)
export const ChannelsWithStatsSchema = z.array(ChannelWithStatsSchema);
export type ChannelsWithStats = z.infer<typeof ChannelsWithStatsSchema>;

// Channel summary (for lists, nested views)
export const ChannelSummarySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string().url().nullable(),
});
export type ChannelSummary = z.infer<typeof ChannelSummarySchema>;

// ============================================
// Channel Request Schemas
// ============================================

// Create channel request
export const CreateChannelRequestSchema = z.object({
  name: z
    .string()
    .min(CHANNEL_NAME_MIN, 'Channel name is required')
    .max(CHANNEL_NAME_MAX, `Channel name must be at most ${CHANNEL_NAME_MAX} characters`),
  handle: z
    .string()
    .min(CHANNEL_HANDLE_MIN, `Handle must be at least ${CHANNEL_HANDLE_MIN} characters`)
    .max(CHANNEL_HANDLE_MAX, `Handle must be at most ${CHANNEL_HANDLE_MAX} characters`)
    .regex(
      CHANNEL_HANDLE_PATTERN,
      'Handle can only contain letters, numbers, underscores, and hyphens'
    ),
  description: z.string().max(CHANNEL_DESCRIPTION_MAX).optional(),
});
export type CreateChannelRequest = z.infer<typeof CreateChannelRequestSchema>;

// Update channel request
export const UpdateChannelRequestSchema = z.object({
  name: z.string().min(CHANNEL_NAME_MIN).max(CHANNEL_NAME_MAX).optional(),
  description: z.string().max(CHANNEL_DESCRIPTION_MAX).optional(),
  bannerUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpdateChannelRequest = z.infer<typeof UpdateChannelRequestSchema>;

// ============================================
// Channel Response Schemas
// ============================================

// Single channel response
export const ChannelResponseSchema = z.object({
  data: ChannelWithStatsSchema,
});
export type ChannelResponse = z.infer<typeof ChannelResponseSchema>;

// Multiple channels response
export const ChannelsResponseSchema = z.object({
  data: z.array(ChannelSummarySchema),
});
export type ChannelsResponse = z.infer<typeof ChannelsResponseSchema>;

// ============================================
// Channel Error Constants
// ============================================

export const CHANNEL_ERRORS = {
  CHANNEL_NOT_FOUND: 'Channel not found',
  HANDLE_ALREADY_EXISTS: 'Channel handle already taken',
  USER_ALREADY_HAS_CHANNEL: 'User already has a channel',
  NOT_CHANNEL_OWNER: 'You are not the owner of this channel',
  INVALID_HANDLE: 'Invalid channel handle format',
} as const;

export type ChannelErrorCode = keyof typeof CHANNEL_ERRORS;
export type ChannelErrorMessage = (typeof CHANNEL_ERRORS)[ChannelErrorCode];

// ============================================
// Channel URL Parameter Schemas
// ============================================

// Channel handle parameter (for GET /channels/:handle)
export const ChannelHandleParamSchema = z.object({
  handle: z
    .string()
    .min(CHANNEL_HANDLE_MIN, `Handle must be at least ${CHANNEL_HANDLE_MIN} characters`)
    .max(CHANNEL_HANDLE_MAX, `Handle must be at most ${CHANNEL_HANDLE_MAX} characters`)
    .regex(
      CHANNEL_HANDLE_PATTERN,
      'Handle can only contain letters, numbers, underscores, and hyphens'
    ),
});
export type ChannelHandleParam = z.infer<typeof ChannelHandleParamSchema>;
