import type { Video, VideoDetail, VideoWithChannel } from '@streambox/shared-types';
import { apiClient, type PaginatedResponse } from '@/lib/api';
import type { VideoFeedParams, ChannelVideosParams } from '../types';

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
  const result = await apiClient.get<{ data: VideoDetail } | VideoDetail>(
    `/videos/${idOrSlug}`
  );

  // Handle both wrapped and unwrapped responses
  return 'data' in result ? result.data : result;
}

/**
 * Fetch videos for a specific channel
 */
export async function fetchChannelVideos(
  channelId: string,
  params: ChannelVideosParams = {}
): Promise<PaginatedResponse<Video>> {
  const { page = 1, pageSize = 20, sortBy = 'recent' } = params;

  return apiClient.get(`/channels/${channelId}/videos`, {
    page,
    pageSize,
    sortBy,
  });
}
