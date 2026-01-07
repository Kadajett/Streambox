// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  channel: Channel | null;
  subscriberCount: number;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ============================================
// Channel Types
// ============================================

export interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  bannerUrl: string | null;
  avatarUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelWithStats extends Channel {
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
}

export interface CreateChannelDto {
  name: string;
  handle: string;
  description?: string;
}

export interface UpdateChannelDto {
  name?: string;
  description?: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

// ============================================
// Video Types
// ============================================

export type VideoStatus = 'draft' | 'processing' | 'ready' | 'failed';
export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  status: VideoStatus;
  visibility: VideoVisibility;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface VideoWithChannel extends Video {
  channel: Channel;
}

export interface VideoDetail extends VideoWithChannel {
  isLiked: boolean | null;
  isDisliked: boolean | null;
  isSubscribed: boolean | null;
}

export interface CreateVideoDto {
  title: string;
  description?: string;
  visibility?: VideoVisibility;
}

export interface UpdateVideoDto {
  title?: string;
  description?: string;
  visibility?: VideoVisibility;
  thumbnailUrl?: string;
}

// ============================================
// Comment Types
// ============================================

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithUser extends Comment {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  replies?: CommentWithUser[];
  replyCount: number;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

// ============================================
// Like Types
// ============================================

export type LikeType = 'like' | 'dislike';

export interface VideoLike {
  id: string;
  userId: string;
  videoId: string;
  type: LikeType;
  createdAt: string;
}

export interface LikeVideoDto {
  type: LikeType;
}

// ============================================
// Subscription Types
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  channelId: string;
  createdAt: string;
}

export interface SubscriptionWithChannel extends Subscription {
  channel: Channel;
}

// ============================================
// Transcode Job Types
// ============================================

export type TranscodeStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TranscodeJob {
  id: string;
  videoId: string;
  status: TranscodeStatus;
  progress: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Feed Types
// ============================================

export interface FeedQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
}

export interface SearchQuery extends FeedQuery {
  q: string;
}

// ============================================
// Health Check
// ============================================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    storage: 'connected' | 'disconnected';
  };
}
