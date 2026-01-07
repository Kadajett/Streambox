// ============================================
// StreamBox Shared Types
// ============================================
// All schemas export both the Zod schema (for validation)
// and the inferred TypeScript type (for type safety)
//
// Naming Convention:
// - Schemas: {Name}Schema (e.g., UserSchema, VideoSchema)
// - Types: {Name} (e.g., User, Video)
// - Request schemas: {Action}{Resource}RequestSchema (e.g., CreateVideoRequestSchema)
// - Response schemas: {Resource}ResponseSchema (e.g., VideoResponseSchema)
// - Error constants: {RESOURCE}_ERRORS (e.g., AUTH_ERRORS, VIDEO_ERRORS)
// ============================================

// Re-export zod for convenience
export { z } from 'zod';

// Common/Shared
export {
  // Schemas
  TimestampsSchema,
  PaginationMetaSchema,
  PaginationQuerySchema,
  ApiErrorDetailSchema,
  ApiErrorResponseSchema,
  MessageResponseSchema,
  IdParamSchema,
  SortOrderSchema,
  // Types
  type Timestamps,
  type PaginationMeta,
  type PaginationQuery,
  type ApiErrorDetail,
  type ApiErrorResponse,
  type MessageResponse,
  type IdParam,
  type SortOrder,
  // Factory functions
  createPaginatedResponseSchema,
  createApiResponseSchema,
} from './schemas/common';

// User
export {
  // Constants
  USERNAME_PATTERN,
  USERNAME_MIN,
  USERNAME_MAX,
  PASSWORD_MIN,
  DISPLAY_NAME_MAX,
  // Schemas
  UserBaseSchema,
  UserSchema,
  UserDtoSchema,
  UserProfileSchema,
  UserSummarySchema,
  JwtPayloadSchema,
  CurrentUserSchema,
  // Types
  type User,
  type UserDto,
  type UserProfile,
  type UserSummary,
  type JwtPayload,
  type CurrentUser,
} from './schemas/user';

// Auth
export {
  // Request Schemas
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  ChangePasswordRequestSchema,
  ResetPasswordRequestSchema,
  ConfirmResetPasswordRequestSchema,
  // Response Schemas
  TokenPairSchema,
  AuthResponseSchema,
  LogoutResponseSchema,
  // Types
  type RegisterRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type ChangePasswordRequest,
  type ResetPasswordRequest,
  type ConfirmResetPasswordRequest,
  type TokenPair,
  type AuthResponse,
  type LogoutResponse,
  // Error Constants
  AUTH_ERRORS,
  type AuthErrorCode,
  type AuthErrorMessage,
} from './schemas/auth';

// Channel
export {
  // Constants
  CHANNEL_NAME_MIN,
  CHANNEL_NAME_MAX,
  CHANNEL_HANDLE_MIN,
  CHANNEL_HANDLE_MAX,
  CHANNEL_HANDLE_PATTERN,
  CHANNEL_DESCRIPTION_MAX,
  CHANNEL_USER_CHANNEL_LIMIT,
  // Schemas
  ChannelBaseSchema,
  ChannelSchema,
  ChannelWithStatsSchema,
  ChannelsWithStatsSchema,
  ChannelSummarySchema,
  CreateChannelRequestSchema,
  UpdateChannelRequestSchema,
  ChannelResponseSchema,
  ChannelsResponseSchema,
  ChannelHandleParamSchema,
  // Types
  type Channel,
  type ChannelWithStats,
  type ChannelsWithStats,
  type ChannelSummary,
  type CreateChannelRequest,
  type UpdateChannelRequest,
  type ChannelResponse,
  type ChannelsResponse,
  type ChannelHandleParam,
  // Error Constants
  CHANNEL_ERRORS,
  type ChannelErrorCode,
  type ChannelErrorMessage,
} from './schemas/channel';

// Video
export {
  // Constants
  VIDEO_TITLE_MIN,
  VIDEO_TITLE_MAX,
  VIDEO_DESCRIPTION_MAX,
  // Schemas
  VideoStatusSchema,
  VideoVisibilitySchema,
  VideoBaseSchema,
  VideoSchema,
  VideoWithChannelSchema,
  VideoDetailSchema,
  VideoSummarySchema,
  CreateVideoRequestSchema,
  UpdateVideoRequestSchema,
  PublishVideoRequestSchema,
  VideoSortBySchema,
  VideoListQuerySchema,
  ChannelVideosQuerySchema,
  VideoResponseSchema,
  VideoUploadStatusResponseSchema,
  // Types
  type VideoStatus,
  type VideoVisibility,
  type Video,
  type VideoWithChannel,
  type VideoDetail,
  type VideoSummary,
  type CreateVideoRequest,
  type UpdateVideoRequest,
  type PublishVideoRequest,
  type VideoSortBy,
  type VideoListQuery,
  type ChannelVideosQuery,
  type VideoResponse,
  type VideoUploadStatusResponse,
  // Error Constants
  VIDEO_ERRORS,
  type VideoErrorCode,
  type VideoErrorMessage,
} from './schemas/video';

// Comment
export {
  // Constants
  COMMENT_CONTENT_MIN,
  COMMENT_CONTENT_MAX,
  // Schemas
  CommentBaseSchema,
  CommentSchema,
  CommentWithUserSchema,
  CommentWithRepliesSchema,
  CreateCommentRequestSchema,
  UpdateCommentRequestSchema,
  CommentSortBySchema,
  CommentsQuerySchema,
  RepliesQuerySchema,
  CommentResponseSchema,
  // Types
  type Comment,
  type CommentWithUser,
  type CommentWithReplies,
  type CreateCommentRequest,
  type UpdateCommentRequest,
  type CommentSortBy,
  type CommentsQuery,
  type RepliesQuery,
  type CommentResponse,
  // Error Constants
  COMMENT_ERRORS,
  type CommentErrorCode,
  type CommentErrorMessage,
} from './schemas/comment';

// Like
export {
  // Schemas
  LikeTypeSchema,
  VideoLikeSchema,
  CommentLikeSchema,
  LikeVideoRequestSchema,
  LikeResponseSchema,
  CommentLikeResponseSchema,
  // Types
  type LikeType,
  type VideoLike,
  type CommentLike,
  type LikeVideoRequest,
  type LikeResponse,
  type CommentLikeResponse,
} from './schemas/like';

// Subscription
export {
  // Schemas
  SubscriptionSchema,
  SubscriptionWithChannelSchema,
  SubscriptionsQuerySchema,
  SubscriptionResponseSchema,
  SubscriptionStatusSchema,
  // Types
  type Subscription,
  type SubscriptionWithChannel,
  type SubscriptionsQuery,
  type SubscriptionResponse,
  type SubscriptionStatus,
  // Error Constants
  SUBSCRIPTION_ERRORS,
  type SubscriptionErrorCode,
  type SubscriptionErrorMessage,
} from './schemas/subscription';

// Feed & Search
export {
  // Schemas
  FeedTypeSchema,
  FeedQuerySchema,
  SearchQuerySchema,
  TrendingQuerySchema,
  HistoryQuerySchema,
  CategorySchema,
  SearchResultTypeSchema,
  SearchSuggestionsResponseSchema,
  TranscodeStatusSchema,
  TranscodeJobSchema,
  TranscodeJobResponseSchema,
  // Types
  type FeedType,
  type FeedQuery,
  type SearchQuery,
  type TrendingQuery,
  type HistoryQuery,
  type Category,
  type SearchResultType,
  type SearchSuggestionsResponse,
  type TranscodeStatus,
  type TranscodeJob,
  type TranscodeJobResponse,
} from './schemas/feed';

// Health
export {
  // Schemas
  ServiceStatusSchema,
  HealthStatusSchema,
  HealthCheckResponseSchema,
  SimpleHealthResponseSchema,
  // Types
  type ServiceStatus,
  type HealthStatus,
  type HealthCheckResponse,
  type SimpleHealthResponse,
} from './schemas/health';
