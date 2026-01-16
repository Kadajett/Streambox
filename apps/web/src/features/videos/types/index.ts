// Re-export shared types from the monorepo package
export type {
  // Video entity types
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
} from '@streambox/shared-types';

// Web-specific types (UI convenience wrappers)

/**
 * Simplified params for the home feed
 * Maps to VideoListQuery from shared-types
 */
export interface VideoFeedParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  category?: string;
}

/**
 * Simplified params for channel video lists
 * Maps to ChannelVideosQuery from shared-types
 */
export interface ChannelVideosParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
}
