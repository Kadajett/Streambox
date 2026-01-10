// Videos Feature - Public API
export {
  videoKeys,
  fetchPublicFeed,
  fetchTrendingVideos,
  fetchVideo,
  fetchChannelVideos,
  usePublicFeed,
  usePublicFeedInfinite,
  useTrendingVideos,
  useVideo,
  useVideoStreamUrl,
  useVideoThumbnailUrl,
  useChannelVideos,
} from './api';

export type {
  Video,
  VideoDetail,
  VideoWithChannel,
  VideoStatus,
  VideoVisibility,
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
