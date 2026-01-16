import type {
  Video,
  VideoDetail,
  VideoWithChannel,
  VideoUploadStatusResponse,
} from '@streambox/shared-types';
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
  const result = await apiClient.get<{ data: VideoDetail } | VideoDetail>(`/videos/${idOrSlug}`);

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

// ============================================
export async function uploadChannelVideo(
  channelId: string,
  formData: FormData
): Promise<VideoDetail> {
  // debugger;
  console.log(
    'uploadChannelVideo fetch post called with:',
    formData.get('title'),
    formData.get('description'),
    formData.get('file')
  );
  const result = await apiClient.postFormData<{ data: VideoDetail } | VideoDetail>(
    `/channels/${channelId}/videos`,
    formData
  );

  // Handle both wrapped and unwrapped responses
  return 'data' in result ? result.data : result;
}

// ============================================
// Video Status (for transcoding progress)
// ============================================

// Re-export for backwards compatibility
export type { VideoUploadStatusResponse as VideoStatusResponse } from '@streambox/shared-types';

/**
 * Fetch video transcoding status
 */
export async function fetchVideoStatus(videoId: string): Promise<VideoUploadStatusResponse> {
  const result = await apiClient.get<
    { data: VideoUploadStatusResponse } | VideoUploadStatusResponse
  >(`/videos/${videoId}/status`);
  return 'data' in result ? result.data : result;
}

// ============================================
// Owner Channel Videos (includes all statuses)
// ============================================

/**
 * Fetch all videos for a channel (for owners - includes non-public videos)
 */
export async function fetchOwnerChannelVideos(
  channelId: string,
  params: ChannelVideosParams = {}
): Promise<PaginatedResponse<Video>> {
  const { page = 1, pageSize = 20, sortBy = 'recent' } = params;

  return apiClient.get(`/channels/${channelId}/videos/all`, {
    page,
    pageSize,
    sortBy,
  });
}

// ============================================
// Delete Channel Video
// ============================================

/**
 * Delete a channel video by ID
 */
export async function deleteChannelVideo(videoId: string): Promise<void> {
  await apiClient.delete(`/videos/${videoId}`);
}
