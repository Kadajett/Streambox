import { z } from 'zod';

// ============================================
// Like Schemas
// ============================================

// Like type enum
export const LikeTypeSchema = z.enum(['like', 'dislike']);
export type LikeType = z.infer<typeof LikeTypeSchema>;

// Video like entity
export const VideoLikeSchema = z.object({
  id: z.cuid(),
  userId: z.cuid(),
  videoId: z.cuid(),
  type: LikeTypeSchema,
  createdAt: z.iso.datetime(),
});
export type VideoLike = z.infer<typeof VideoLikeSchema>;

// Comment like entity
export const CommentLikeSchema = z.object({
  id: z.cuid(),
  userId: z.cuid(),
  commentId: z.cuid(),
  createdAt: z.iso.datetime(),
});
export type CommentLike = z.infer<typeof CommentLikeSchema>;

// ============================================
// Like Request Schemas
// ============================================

// Like/dislike video request
export const LikeVideoRequestSchema = z.object({
  type: LikeTypeSchema,
});
export type LikeVideoRequest = z.infer<typeof LikeVideoRequestSchema>;

// ============================================
// Like Response Schemas
// ============================================

// Like action response (after like/dislike/unlike)
export const LikeResponseSchema = z.object({
  likeCount: z.number().int().nonnegative(),
  dislikeCount: z.number().int().nonnegative(),
  userLikeType: LikeTypeSchema.nullable(), // null if no like
});
export type LikeResponse = z.infer<typeof LikeResponseSchema>;

// Comment like response
export const CommentLikeResponseSchema = z.object({
  likeCount: z.number().int().nonnegative(),
  isLiked: z.boolean(),
});
export type CommentLikeResponse = z.infer<typeof CommentLikeResponseSchema>;
