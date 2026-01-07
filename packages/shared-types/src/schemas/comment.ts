import { z } from 'zod';
import { TimestampsSchema, PaginationQuerySchema, SortOrderSchema } from './common';
import { UserSummarySchema } from './user';

// ============================================
// Comment Schemas
// ============================================

// Validation constants
export const COMMENT_CONTENT_MIN = 1;
export const COMMENT_CONTENT_MAX = 2000;

// Base comment fields
export const CommentBaseSchema = z.object({
  id: z.string().cuid(),
  content: z
    .string()
    .min(COMMENT_CONTENT_MIN, 'Comment cannot be empty')
    .max(COMMENT_CONTENT_MAX, `Comment must be at most ${COMMENT_CONTENT_MAX} characters`),
  userId: z.string().cuid(),
  videoId: z.string().cuid(),
  parentId: z.string().cuid().nullable(), // null for top-level comments
  likeCount: z.number().int().nonnegative(),
});

// Full comment entity
export const CommentSchema = CommentBaseSchema.merge(TimestampsSchema);
export type Comment = z.infer<typeof CommentSchema>;

// Comment with user info (for display)
export const CommentWithUserSchema = CommentSchema.extend({
  user: UserSummarySchema,
  replyCount: z.number().int().nonnegative(),
  isLiked: z.boolean().nullable(), // null if not logged in
});
export type CommentWithUser = z.infer<typeof CommentWithUserSchema>;

// Comment with replies (for threaded view)
export const CommentWithRepliesSchema: z.ZodType<CommentWithRepliesType> = CommentWithUserSchema.extend({
  replies: z.lazy(() => z.array(CommentWithRepliesSchema)).optional(),
});
type CommentWithRepliesType = z.infer<typeof CommentWithUserSchema> & {
  replies?: CommentWithRepliesType[];
};
export type CommentWithReplies = z.infer<typeof CommentWithRepliesSchema>;

// ============================================
// Comment Request Schemas
// ============================================

// Create comment request
export const CreateCommentRequestSchema = z.object({
  content: z
    .string()
    .min(COMMENT_CONTENT_MIN, 'Comment cannot be empty')
    .max(COMMENT_CONTENT_MAX, `Comment must be at most ${COMMENT_CONTENT_MAX} characters`),
  parentId: z.string().cuid().optional(), // for replies
});
export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;

// Update comment request
export const UpdateCommentRequestSchema = z.object({
  content: z
    .string()
    .min(COMMENT_CONTENT_MIN, 'Comment cannot be empty')
    .max(COMMENT_CONTENT_MAX, `Comment must be at most ${COMMENT_CONTENT_MAX} characters`),
});
export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;

// ============================================
// Comment Query Schemas
// ============================================

// Comment sort options
export const CommentSortBySchema = z.enum(['recent', 'oldest', 'popular']);
export type CommentSortBy = z.infer<typeof CommentSortBySchema>;

// Comments list query
export const CommentsQuerySchema = PaginationQuerySchema.extend({
  sortBy: CommentSortBySchema.default('recent'),
  order: SortOrderSchema.default('desc'),
});
export type CommentsQuery = z.infer<typeof CommentsQuerySchema>;

// Replies query (for loading more replies)
export const RepliesQuerySchema = PaginationQuerySchema.extend({
  parentId: z.string().cuid(),
});
export type RepliesQuery = z.infer<typeof RepliesQuerySchema>;

// ============================================
// Comment Response Schemas
// ============================================

// Single comment response
export const CommentResponseSchema = z.object({
  data: CommentWithUserSchema,
});
export type CommentResponse = z.infer<typeof CommentResponseSchema>;

// ============================================
// Comment Error Constants
// ============================================

export const COMMENT_ERRORS = {
  COMMENT_NOT_FOUND: 'Comment not found',
  NOT_COMMENT_OWNER: 'You are not the owner of this comment',
  VIDEO_NOT_FOUND: 'Video not found',
  PARENT_COMMENT_NOT_FOUND: 'Parent comment not found',
  CANNOT_REPLY_TO_REPLY: 'Cannot reply to a reply (max depth is 1)',
  COMMENT_TOO_LONG: 'Comment is too long',
} as const;

export type CommentErrorCode = keyof typeof COMMENT_ERRORS;
export type CommentErrorMessage = (typeof COMMENT_ERRORS)[CommentErrorCode];
