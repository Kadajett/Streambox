import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getHlsUrl, getThumbnailUrl } from '@/lib/api';
import { videoKeys } from './keys';
import {
  fetchPublicFeed,
  fetchTrendingVideos,
  fetchVideo,
  fetchChannelVideos,
  fetchVideoStatus,
  fetchOwnerChannelVideos,
} from './fetchers';
import type { VideoFeedParams } from '../types';

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
  const { page = 1, pageSize = 20, sortBy = 'recent', category, enabled = true } = options;

  const params: VideoFeedParams = { page, pageSize, sortBy, category };

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
  const { pageSize = 20, sortBy = 'recent', category, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: videoKeys.feed({ pageSize, sortBy, category }),
    queryFn: ({ pageParam = 1 }) =>
      fetchPublicFeed({ page: pageParam, pageSize, sortBy, category }),
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
export function useVideoStreamUrl(videoId: string | undefined): string | null {
  if (!videoId) return null;
  return getHlsUrl(videoId);
}

/**
 * Get video thumbnail URL
 */
export function useVideoThumbnailUrl(thumbnailUrl: string | null | undefined): string {
  return getThumbnailUrl(thumbnailUrl);
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
// Video Status Polling Hook
// ============================================

interface UseVideoStatusOptions {
  enabled?: boolean;
  /** Polling interval in ms. Set to 0 to disable polling. Default: 3000 */
  pollInterval?: number;
  /** Stop polling when video reaches ready/failed status. Default: true */
  stopOnComplete?: boolean;
}

/**
 * Poll video transcoding status
 * Automatically stops polling when video is ready or failed
 */
export function useVideoStatus(videoId: string, options: UseVideoStatusOptions = {}) {
  const { enabled = true, pollInterval = 3000, stopOnComplete = true } = options;

  const query = useQuery({
    queryKey: videoKeys.videoTranscodingStatus(videoId),
    queryFn: () => fetchVideoStatus(videoId),
    enabled: enabled && !!videoId,
    refetchInterval: (query) => {
      if (!pollInterval) return false;
      if (stopOnComplete && query.state.data) {
        const status = query.state.data.status;
        if (status === 'ready' || status === 'failed') {
          return false;
        }
      }
      return pollInterval;
    },
    staleTime: 1000, // Consider stale after 1 second
  });

  return {
    ...query,
    isProcessing: query.data?.status === 'processing',
    isReady: query.data?.status === 'ready',
    isFailed: query.data?.status === 'failed',
    progress: query.data?.progress ?? 0,
  };
}

// ============================================
// Owner Channel Videos Hook (includes all statuses)
// ============================================

interface UseOwnerChannelVideosOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  enabled?: boolean;
}

/**
 * Fetch all videos for a channel owner (includes processing, pending, etc.)
 */
export function useOwnerChannelVideos(
  channelId: string,
  options: UseOwnerChannelVideosOptions = {}
) {
  const { page = 1, pageSize = 20, sortBy = 'recent', enabled = true } = options;

  return useQuery({
    queryKey: videoKeys.ownerChannelVideos(channelId, { page }),
    queryFn: () => fetchOwnerChannelVideos(channelId, { page, pageSize, sortBy }),
    enabled: enabled && !!channelId,
    staleTime: 1000 * 30, // 30 seconds - owner needs fresher data
  });
}

// ============================================
// Multi-Video Status Polling Hook
// ============================================

/**
 * Poll status for multiple videos at once
 * Useful for showing progress of multiple uploads
 */
export function useMultipleVideoStatuses(videoIds: string[], options: UseVideoStatusOptions = {}) {
  const { enabled = true, pollInterval = 3000 } = options;

  const queries = videoIds.map((videoId) =>
    useQuery({
      queryKey: videoKeys.videoTranscodingStatus(videoId),
      queryFn: () => fetchVideoStatus(videoId),
      enabled: enabled && !!videoId,
      refetchInterval: pollInterval,
      staleTime: 1000,
    })
  );

  const allStatuses = queries.map((q, i) => ({
    videoId: videoIds[i],
    status: q.data?.status,
    progress: q.data?.progress ?? 0,
    isLoading: q.isLoading,
    error: q.error,
  }));

  const processingCount = allStatuses.filter((s) => s.status === 'processing').length;
  const readyCount = allStatuses.filter((s) => s.status === 'ready').length;
  const failedCount = allStatuses.filter((s) => s.status === 'failed').length;

  return {
    statuses: allStatuses,
    processingCount,
    readyCount,
    failedCount,
    isAnyProcessing: processingCount > 0,
    isAllComplete: processingCount === 0 && allStatuses.length > 0,
  };
}
