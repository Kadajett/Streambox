import { z } from 'zod';
import {
  UserDtoSchema,
  USERNAME_PATTERN,
  USERNAME_MIN,
  USERNAME_MAX,
  PASSWORD_MIN,
  DISPLAY_NAME_MAX,
} from './user';

// ============================================
// Auth Request Schemas
// ============================================

// Register request
export const RegisterRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z
    .string()
    .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
    .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters`)
    .regex(USERNAME_PATTERN, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`),
  displayName: z
    .string()
    .max(DISPLAY_NAME_MAX, `Display name must be at most ${DISPLAY_NAME_MAX} characters`)
    .optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Login request
export const LoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Refresh token request
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Change password request
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`),
});
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Reset password request (send email)
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Confirm reset password (with token)
export const ConfirmResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`),
});
export type ConfirmResetPasswordRequest = z.infer<typeof ConfirmResetPasswordRequestSchema>;

// ============================================
// Auth Response Schemas
// ============================================

// Token pair
export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof TokenPairSchema>;

// Auth response (login/register success)
export const AuthResponseSchema = z.object({
  user: UserDtoSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Logout response
export const LogoutResponseSchema = z.object({
  message: z.string(),
  userId: z.string().cuid(),
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// ============================================
// Auth Error Constants
// ============================================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already taken',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  SESSION_EXPIRED: 'Session has expired',
  PASSWORD_TOO_WEAK: 'Password does not meet requirements',
  ACCOUNT_DISABLED: 'Account has been disabled',
  EMAIL_NOT_VERIFIED: 'Email address not verified',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  PASSWORD_MISMATCH: 'Current password is incorrect',
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS;
export type AuthErrorMessage = (typeof AUTH_ERRORS)[AuthErrorCode];
