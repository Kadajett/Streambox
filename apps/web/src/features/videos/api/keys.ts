import type { VideoFeedParams } from '../types';

/**
 * Query keys for video-related queries
 * Structured for efficient cache invalidation
 */
export const videoKeys = {
  // Base key for all video queries
  all: ['videos'] as const,

  // Feed queries
  feeds: () => [...videoKeys.all, 'feed'] as const,
  feed: (params: VideoFeedParams) => [...videoKeys.feeds(), params] as const,

  // Trending queries
  trending: () => [...videoKeys.all, 'trending'] as const,
  trendingWithParams: (params: { category?: string }) =>
    [...videoKeys.trending(), params] as const,

  // Single video queries
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...videoKeys.details(), idOrSlug] as const,

  // Channel video queries
  channelVideos: () => [...videoKeys.all, 'channel'] as const,
  channelVideosList: (channelId: string, params?: { page?: number }) =>
    [...videoKeys.channelVideos(), channelId, params] as const,
};
