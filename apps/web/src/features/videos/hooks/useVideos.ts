import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchPublicFeed,
  fetchTrendingVideos,
  fetchVideo,
  fetchChannelVideos,
  getHlsUrl,
  getThumbnailUrl,
  type VideoFeedParams,
} from '../api/videos';
import { videoKeys } from '../keys';

// ============================================
// Public Feed Hook (Home Page)
// ============================================

interface UsePublicFeedOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  category?: string;
  enabled?: boolean;
}

/**
 * Fetch paginated public video feed
 * Use for home page video grid
 */
export function usePublicFeed(options: UsePublicFeedOptions = {}) {
  const { page = 1, pageSize = 20, sortBy = 'recent', enabled = true } = options;

  const params: VideoFeedParams = { page, pageSize, sortBy };

  return useQuery({
    queryKey: videoKeys.feed(params),
    queryFn: () => fetchPublicFeed(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Infinite scroll version of public feed
 */
export function usePublicFeedInfinite(options: Omit<UsePublicFeedOptions, 'page'> = {}) {
  const { pageSize = 20, sortBy = 'recent', enabled = true } = options;

  return useInfiniteQuery({
    queryKey: videoKeys.feed({ pageSize, sortBy }),
    queryFn: ({ pageParam = 1 }) => fetchPublicFeed({ page: pageParam, pageSize, sortBy }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * pageSize;
      if (totalFetched >= lastPage.meta.total) {
        return undefined;
      }
      return allPages.length + 1;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// Trending Videos Hook
// ============================================

interface UseTrendingOptions {
  category?: string;
  enabled?: boolean;
}

/**
 * Fetch trending videos
 */
export function useTrendingVideos(options: UseTrendingOptions = {}) {
  const { category, enabled = true } = options;

  return useQuery({
    queryKey: videoKeys.trendingWithParams({ category }),
    queryFn: () => fetchTrendingVideos({ category }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - trending changes less frequently
  });
}

// ============================================
// Single Video Hook (Watch Page)
// ============================================

interface UseVideoOptions {
  enabled?: boolean;
}

/**
 * Fetch single video details
 * Use on watch page - accepts ID or slug
 */
export function useVideo(idOrSlug: string, options: UseVideoOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: videoKeys.detail(idOrSlug),
    queryFn: () => fetchVideo(idOrSlug),
    enabled: enabled && !!idOrSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get video stream URL
 * Returns the HLS master playlist URL
 */
export function useVideoStreamUrl(videoId: string | undefined) {
  if (!videoId) return null;
  return getHlsUrl(videoId);
}

/**
 * Get video thumbnail URL
 */
export function useVideoThumbnailUrl(videoId: string | undefined) {
  if (!videoId) return null;
  return getThumbnailUrl(videoId);
}

// ============================================
// Channel Videos Hook
// ============================================

interface UseChannelVideosOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  enabled?: boolean;
}

/**
 * Fetch videos for a specific channel
 */
export function useChannelVideos(channelId: string, options: UseChannelVideosOptions = {}) {
  const { page = 1, pageSize = 20, sortBy = 'recent', enabled = true } = options;

  return useQuery({
    queryKey: videoKeys.channelVideosList(channelId, { page }),
    queryFn: () => fetchChannelVideos(channelId, { page, pageSize, sortBy }),
    enabled: enabled && !!channelId,
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// Prefetch Helpers
// ============================================

export { videoKeys };
