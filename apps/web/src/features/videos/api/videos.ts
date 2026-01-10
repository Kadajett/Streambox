import type { Video, VideoDetail, VideoWithChannel } from '@streambox/shared-types';
import {
  apiClient,
  getAvatarUrl,
  getHlsUrl,
  getThumbnailUrl,
  type PaginatedResponse,
} from '@/lib/api';

// ============================================
// Types
// ============================================

export interface VideoFeedParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  category?: string;
}

// Re-export from lib/api for convenience
export { getAvatarUrl, getHlsUrl, getThumbnailUrl };
export type { PaginatedResponse };

// ============================================
// API Functions (pure async, no React)
// ============================================

/**
 * Fetch public video feed for home page
 */
export async function fetchPublicFeed(
  params: VideoFeedParams = {}
): Promise<PaginatedResponse<VideoWithChannel>> {
  const { page = 1, pageSize = 20, sortBy = 'recent', category } = params;

  return apiClient.get('/feed', {
    page,
    pageSize,
    sortBy,
    category,
  });
}

/**
 * Fetch trending videos
 */
export async function fetchTrendingVideos(
  params: { page?: number; pageSize?: number; category?: string } = {}
): Promise<PaginatedResponse<VideoWithChannel>> {
  const { page = 1, pageSize = 20, category } = params;

  return apiClient.get('/feed/trending', {
    page,
    pageSize,
    category,
  });
}

/**
 * Fetch single video by ID or slug
 */
export async function fetchVideo(idOrSlug: string): Promise<VideoDetail> {
  const result = await apiClient.get<{ data: VideoDetail } | VideoDetail>(`/videos/${idOrSlug}`);

  // Handle both wrapped and unwrapped responses
  return 'data' in result ? result.data : result;
}

/**
 * Fetch videos for a specific channel
 */
export async function fetchChannelVideos(
  channelId: string,
  params: { page?: number; pageSize?: number; sortBy?: string } = {}
): Promise<PaginatedResponse<Video>> {
  const { page = 1, pageSize = 20, sortBy = 'recent' } = params;

  return apiClient.get(`/channels/${channelId}/videos`, {
    page,
    pageSize,
    sortBy,
  });
}

// ============================================
// URL Helpers
// ============================================

/**
 * Get video page URL (for routing)
 */
export function getVideoPageUrl(video: { id: string; slug?: string | null }): string {
  return `/watch/${video.slug ?? video.id}`;
}
