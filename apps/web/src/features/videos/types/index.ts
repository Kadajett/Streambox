// Re-export shared types from the monorepo package
export type {
  Video,
  VideoDetail,
  VideoWithChannel,
  VideoStatus,
  VideoVisibility,
} from '@streambox/shared-types';

// Web-specific types
export interface VideoFeedParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  category?: string;
}

export interface ChannelVideosParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
}
