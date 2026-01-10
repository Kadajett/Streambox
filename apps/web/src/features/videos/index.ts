// API functions
export {
  fetchPublicFeed,
  fetchTrendingVideos,
  fetchVideo,
  fetchChannelVideos,
  getHlsUrl,
  getThumbnailUrl,
  getVideoPageUrl,
  type VideoFeedParams,
  type PaginatedResponse,
} from './api/videos';

// Query keys
export { videoKeys } from './keys';

// React Query hooks
export {
  usePublicFeed,
  usePublicFeedInfinite,
  useTrendingVideos,
  useVideo,
  useVideoStreamUrl,
  useVideoThumbnailUrl,
  useChannelVideos,
} from './hooks/useVideos';

// Re-export types from shared-types for convenience
export type {
  Video,
  VideoDetail,
  VideoSummary,
  VideoWithChannel,
  VideoStatus,
  VideoVisibility,
} from '@streambox/shared-types';
