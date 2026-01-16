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
  trendingWithParams: (params: { category?: string }) => [...videoKeys.trending(), params] as const,

  // Single video queries
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...videoKeys.details(), idOrSlug] as const,

  // Channel video queries (public)
  channelVideos: () => [...videoKeys.all, 'channel'] as const,
  channelVideosList: (channelId: string, params?: { page?: number }) =>
    [...videoKeys.channelVideos(), channelId, params] as const,

  ownerChannelBaseKey: (channelId: string) => [...videoKeys.all, 'owner', channelId] as const,
  // Owner channel videos (all statuses)
  ownerChannelVideos: (channelId: string, params?: { page?: number }) =>
    [...videoKeys.ownerChannelBaseKey(channelId), params] as const,

  // Video transcoding status
  videoTranscodingStatus: (videoId: string) =>
    [...videoKeys.all, videoId, 'transcoding-status'] as const,
};
