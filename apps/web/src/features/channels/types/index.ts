// Re-export types from shared-types
export type {
  Channel,
  ChannelWithStats,
  ChannelSummary,
  CreateChannelRequest as CreateChannelInput,
  UpdateChannelRequest as UpdateChannelInput,
} from '@streambox/shared-types';

// Import for extending
import type { ChannelWithStats } from '@streambox/shared-types';

// Extended types specific to the web app

/**
 * Channel with owner details (for public channel page)
 * Note: API returns userId, which references the owner
 */
export interface ChannelWithOwner extends ChannelWithStats {
  owner: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}
