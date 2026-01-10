import { apiClient, type PaginatedResponse } from '@/lib/api';
import type { Channel, ChannelWithOwner, CreateChannelInput, UpdateChannelInput } from '../types';

/**
 * Fetch a channel by handle (public)
 */
export async function fetchChannel(handle: string): Promise<ChannelWithOwner> {
  return apiClient.get(`/channels/${handle}`);
}

/**
 * Fetch current user's channels (requires auth)
 */
export async function fetchMyChannels(): Promise<Channel[]> {
  return apiClient.get('/channels/mine');
}

/**
 * Create a new channel (requires auth)
 */
export async function createChannel(input: CreateChannelInput): Promise<Channel> {
  return apiClient.post('/channels', input);
}

/**
 * Update a channel (requires auth)
 */
export async function updateChannel(
  channelId: string,
  input: UpdateChannelInput
): Promise<Channel> {
  return apiClient.patch(`/channels/${channelId}`, input);
}

/**
 * Delete a channel (requires auth)
 */
export async function deleteChannel(channelId: string): Promise<void> {
  return apiClient.delete(`/channels/${channelId}`);
}

/**
 * List all channels (public)
 */
export async function fetchChannels(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedResponse<Channel>> {
  const { page = 1, pageSize = 20 } = params;
  return apiClient.get('/api/channels', { page, limit: pageSize });
}
