import { z } from 'zod';
import { TimestampsSchema, PaginationQuerySchema, SortOrderSchema } from './common';
import { ChannelSummarySchema } from './channel';

// ============================================
// Video Schemas
// ============================================

// Validation constants
export const VIDEO_TITLE_MIN = 1;
export const VIDEO_TITLE_MAX = 100;
export const VIDEO_DESCRIPTION_MAX = 5000;

// Video status enum
export const VideoStatusSchema = z.enum(['draft', 'processing', 'ready', 'failed']);
export type VideoStatus = z.infer<typeof VideoStatusSchema>;

// Video visibility enum
export const VideoVisibilitySchema = z.enum(['public', 'unlisted', 'private']);
export type VideoVisibility = z.infer<typeof VideoVisibilitySchema>;

// Base video fields
export const VideoBaseSchema = z.object({
  id: z.string().cuid(),
  title: z
    .string()
    .min(VIDEO_TITLE_MIN, 'Title is required')
    .max(VIDEO_TITLE_MAX, `Title must be at most ${VIDEO_TITLE_MAX} characters`),
  description: z.string().max(VIDEO_DESCRIPTION_MAX).nullable(),
  thumbnailUrl: z.string().url().nullable(),
  videoUrl: z.string().url().nullable(),
  duration: z.number().int().nonnegative().nullable(), // in seconds
  status: VideoStatusSchema,
  visibility: VideoVisibilitySchema,
  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  dislikeCount: z.number().int().nonnegative(),
  channelId: z.string().cuid(),
  publishedAt: z.string().datetime().nullable(),
});

// Full video entity
export const VideoSchema = VideoBaseSchema.merge(TimestampsSchema);
export type Video = z.infer<typeof VideoSchema>;

// Video with channel info (for lists)
export const VideoWithChannelSchema = VideoSchema.extend({
  channel: ChannelSummarySchema,
});
export type VideoWithChannel = z.infer<typeof VideoWithChannelSchema>;

// Video detail (for video page, includes user's interaction state)
export const VideoDetailSchema = VideoWithChannelSchema.extend({
  isLiked: z.boolean().nullable(), // null if not logged in
  isDisliked: z.boolean().nullable(),
  isSubscribed: z.boolean().nullable(),
});
export type VideoDetail = z.infer<typeof VideoDetailSchema>;

// Video summary (for cards/thumbnails)
export const VideoSummarySchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  thumbnailUrl: z.string().url().nullable(),
  duration: z.number().int().nonnegative().nullable(),
  viewCount: z.number().int().nonnegative(),
  publishedAt: z.string().datetime().nullable(),
  channel: ChannelSummarySchema,
});
export type VideoSummary = z.infer<typeof VideoSummarySchema>;

// ============================================
// Video Request Schemas
// ============================================

// Create video request
export const CreateVideoRequestSchema = z.object({
  title: z
    .string()
    .min(VIDEO_TITLE_MIN, 'Title is required')
    .max(VIDEO_TITLE_MAX, `Title must be at most ${VIDEO_TITLE_MAX} characters`),
  description: z.string().max(VIDEO_DESCRIPTION_MAX).optional(),
  visibility: VideoVisibilitySchema.default('private'),
});
export type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>;

// Update video request
export const UpdateVideoRequestSchema = z.object({
  title: z
    .string()
    .min(VIDEO_TITLE_MIN)
    .max(VIDEO_TITLE_MAX)
    .optional(),
  description: z.string().max(VIDEO_DESCRIPTION_MAX).optional(),
  visibility: VideoVisibilitySchema.optional(),
  thumbnailUrl: z.string().url().optional(),
});
export type UpdateVideoRequest = z.infer<typeof UpdateVideoRequestSchema>;

// Publish video request (change status to ready)
export const PublishVideoRequestSchema = z.object({
  visibility: VideoVisibilitySchema.default('public'),
});
export type PublishVideoRequest = z.infer<typeof PublishVideoRequestSchema>;

// ============================================
// Video Query Schemas
// ============================================

// Video sort options
export const VideoSortBySchema = z.enum(['recent', 'popular', 'trending', 'oldest', 'relevant']);
export type VideoSortBy = z.infer<typeof VideoSortBySchema>;

// Video list query
export const VideoListQuerySchema = PaginationQuerySchema.extend({
  channelId: z.string().cuid().optional(),
  status: VideoStatusSchema.optional(),
  visibility: VideoVisibilitySchema.optional(),
  sortBy: VideoSortBySchema.default('recent'),
  order: SortOrderSchema.default('desc'),
});
export type VideoListQuery = z.infer<typeof VideoListQuerySchema>;

// Channel videos query (for channel page)
export const ChannelVideosQuerySchema = PaginationQuerySchema.extend({
  sortBy: VideoSortBySchema.default('recent'),
});
export type ChannelVideosQuery = z.infer<typeof ChannelVideosQuerySchema>;

// ============================================
// Video Response Schemas
// ============================================

// Single video response
export const VideoResponseSchema = z.object({
  data: VideoDetailSchema,
});
export type VideoResponse = z.infer<typeof VideoResponseSchema>;

// ============================================
// Video Error Constants
// ============================================

export const VIDEO_ERRORS = {
  VIDEO_NOT_FOUND: 'Video not found',
  NOT_VIDEO_OWNER: 'You are not the owner of this video',
  VIDEO_NOT_READY: 'Video is not ready for viewing',
  VIDEO_PROCESSING: 'Video is still processing',
  VIDEO_FAILED: 'Video processing failed',
  INVALID_VIDEO_FILE: 'Invalid video file format',
  VIDEO_TOO_LARGE: 'Video file is too large',
  CHANNEL_REQUIRED: 'You must create a channel before uploading videos',
} as const;

export type VideoErrorCode = keyof typeof VIDEO_ERRORS;
export type VideoErrorMessage = (typeof VIDEO_ERRORS)[VideoErrorCode];

// ============================================
// Video Upload Status Response
// ============================================

// Response for GET /videos/:id/status
export const VideoUploadStatusResponseSchema = z.object({
  status: VideoStatusSchema,
  progress: z.number().int().min(0).max(100),
  error: z.string().optional(),
});
export type VideoUploadStatusResponse = z.infer<typeof VideoUploadStatusResponseSchema>;
