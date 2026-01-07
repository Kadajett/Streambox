import { z } from 'zod';
import { PaginationQuerySchema } from './common';
import { ChannelWithStatsSchema } from './channel';

// ============================================
// Subscription Schemas
// ============================================

// Subscription entity
export const SubscriptionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  channelId: z.string().cuid(),
  createdAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

// Subscription with channel info
export const SubscriptionWithChannelSchema = SubscriptionSchema.extend({
  channel: ChannelWithStatsSchema,
});
export type SubscriptionWithChannel = z.infer<typeof SubscriptionWithChannelSchema>;

// ============================================
// Subscription Request Schemas
// ============================================

// Subscribe to channel (channelId in URL param)
// No body needed - channelId comes from URL

// ============================================
// Subscription Query Schemas
// ============================================

// User's subscriptions query
export const SubscriptionsQuerySchema = PaginationQuerySchema;
export type SubscriptionsQuery = z.infer<typeof SubscriptionsQuerySchema>;

// ============================================
// Subscription Response Schemas
// ============================================

// Subscribe/unsubscribe response
export const SubscriptionResponseSchema = z.object({
  isSubscribed: z.boolean(),
  subscriberCount: z.number().int().nonnegative(),
});
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;

// Subscription status check response
export const SubscriptionStatusSchema = z.object({
  isSubscribed: z.boolean(),
  subscribedAt: z.string().datetime().nullable(),
});
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// ============================================
// Subscription Error Constants
// ============================================

export const SUBSCRIPTION_ERRORS = {
  CHANNEL_NOT_FOUND: 'Channel not found',
  ALREADY_SUBSCRIBED: 'Already subscribed to this channel',
  NOT_SUBSCRIBED: 'Not subscribed to this channel',
  CANNOT_SUBSCRIBE_OWN_CHANNEL: 'Cannot subscribe to your own channel',
} as const;

export type SubscriptionErrorCode = keyof typeof SUBSCRIPTION_ERRORS;
export type SubscriptionErrorMessage = (typeof SUBSCRIPTION_ERRORS)[SubscriptionErrorCode];
