// Channels Feature - Public API
export {
  channelKeys,
  fetchChannel,
  fetchMyChannels,
  fetchChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  useChannel,
  useMyChannels,
  useChannels,
  useCreateChannel,
  useUpdateChannel,
  useDeleteChannel,
} from './api';

export type {
  Channel,
  ChannelWithStats,
  ChannelSummary,
  ChannelWithOwner,
  CreateChannelInput,
  UpdateChannelInput,
} from './types';

// URL helpers
import { getAvatarUrl } from '@/lib/api';
export { getAvatarUrl };

/**
 * Get channel page URL (for routing)
 */
export function getChannelPageUrl(channel: { handle: string }): string {
  return `/channel/${channel.handle}`;
}
