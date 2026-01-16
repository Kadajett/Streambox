// Videos Feature - Public API
export {
  videoKeys,
  fetchPublicFeed,
  fetchTrendingVideos,
  fetchVideo,
  fetchChannelVideos,
  usePublicFeed,
  usePublicFeedInfinite,
  useOwnerChannelVideos,
  useVideoStatus,
  useTrendingVideos,
  useVideo,
  useVideoStreamUrl,
  useVideoThumbnailUrl,
  useChannelVideos,
  useDeleteChannelVideo,
} from './api';

export type {
  // Entity types
  Video,
  VideoDetail,
  VideoWithChannel,
  VideoSummary,
  // Enum types
  VideoStatus,
  VideoVisibility,
  VideoModerationStatus,
  VideoSortBy,
  // Request types
  CreateVideoRequest,
  UpdateVideoRequest,
  // Query types
  VideoListQuery,
  ChannelVideosQuery,
  // Response types
  VideoUploadStatusResponse,
  // Web-specific types
  VideoFeedParams,
  ChannelVideosParams,
} from './types';

// URL helpers
import { getHlsUrl, getThumbnailUrl } from '@/lib/api';
export { getHlsUrl, getThumbnailUrl };

/**
 * Get video page URL (for routing)
 */
export function getVideoPageUrl(video: { id: string; slug?: string | null }): string {
  return `/watch/${video.slug ?? video.id}`;
}
