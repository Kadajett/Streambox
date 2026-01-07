import { z } from 'zod';
import { TimestampsSchema } from './common';

// ============================================
// User Schemas
// ============================================

// Validation patterns
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const DISPLAY_NAME_MAX = 50;

// Base user fields (without password)
export const UserBaseSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
    .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters`)
    .regex(USERNAME_PATTERN, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string().max(DISPLAY_NAME_MAX).nullable(),
  avatarUrl: z.string().url().nullable(),
});

// Full user entity (as stored in DB, without password hash)
export const UserSchema = UserBaseSchema.merge(TimestampsSchema);
export type User = z.infer<typeof UserSchema>;

// User DTO - for transferring user data (excludes timestamps)
export const UserDtoSchema = UserBaseSchema;
export type UserDto = z.infer<typeof UserDtoSchema>;

// User with channel info (for profile views)
// Note: Channel schema imported where needed to avoid circular deps
export const UserProfileSchema = UserSchema.extend({
  channel: z.any().nullable(), // Will be typed properly with Channel
  subscriberCount: z.number().int().nonnegative(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// Partial user for comments/nested views
export const UserSummarySchema = z.object({
  id: z.string().cuid(),
  username: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

// JWT payload (what's encoded in the token)
export const JwtPayloadSchema = z.object({
  sub: z.string().cuid(), // User ID
  email: z.string().email(),
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// Current user from JWT (attached to request)
export const CurrentUserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;
