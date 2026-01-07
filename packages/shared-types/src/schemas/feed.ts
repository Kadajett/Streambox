import { z } from 'zod';
import { PaginationQuerySchema, SortOrderSchema } from './common';
import { VideoSortBySchema } from './video';

// ============================================
// Feed Query Schemas
// ============================================

// Feed type enum
export const FeedTypeSchema = z.enum(['home', 'trending', 'subscriptions', 'history']);
export type FeedType = z.infer<typeof FeedTypeSchema>;

// Feed query (for home/trending/subscriptions)
export const FeedQuerySchema = PaginationQuerySchema.extend({
  category: z.string().optional(),
  sortBy: VideoSortBySchema.default('recent'),
});
export type FeedQuery = z.infer<typeof FeedQuerySchema>;

// Search query
export const SearchQuerySchema = PaginationQuerySchema.extend({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'video', 'channel']).default('all'),
  sortBy: VideoSortBySchema.default('relevant'),
  order: SortOrderSchema.default('desc'),
  uploadDate: z.enum(['any', 'hour', 'today', 'week', 'month', 'year']).default('any'),
  duration: z.enum(['any', 'short', 'medium', 'long']).default('any'), // short <4min, medium 4-20min, long >20min
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Trending query
export const TrendingQuerySchema = PaginationQuerySchema.extend({
  category: z.string().optional(),
  region: z.string().length(2).optional(), // ISO 3166-1 alpha-2 country code
});
export type TrendingQuery = z.infer<typeof TrendingQuerySchema>;

// Watch history query
export const HistoryQuerySchema = PaginationQuerySchema;
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

// ============================================
// Category Schemas
// ============================================

// Category entity
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().url().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

// ============================================
// Search Response Types
// ============================================

// Search result type discriminator
export const SearchResultTypeSchema = z.enum(['video', 'channel']);
export type SearchResultType = z.infer<typeof SearchResultTypeSchema>;

// Search suggestions
export const SearchSuggestionsResponseSchema = z.object({
  suggestions: z.array(z.string()),
});
export type SearchSuggestionsResponse = z.infer<typeof SearchSuggestionsResponseSchema>;

// ============================================
// Transcode Job Schemas (for video processing)
// ============================================

// Transcode status enum
export const TranscodeStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type TranscodeStatus = z.infer<typeof TranscodeStatusSchema>;

// Transcode job entity
export const TranscodeJobSchema = z.object({
  id: z.string().cuid(),
  videoId: z.string().cuid(),
  status: TranscodeStatusSchema,
  progress: z.number().min(0).max(100),
  error: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TranscodeJob = z.infer<typeof TranscodeJobSchema>;

// Transcode job response
export const TranscodeJobResponseSchema = z.object({
  data: TranscodeJobSchema,
});
export type TranscodeJobResponse = z.infer<typeof TranscodeJobResponseSchema>;
