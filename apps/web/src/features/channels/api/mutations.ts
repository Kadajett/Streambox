import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateChannelRequest, UpdateChannelRequest } from '@streambox/shared-types';
import { channelKeys } from './keys';
import { createChannel, updateChannel, deleteChannel } from './fetchers';

/**
 * Create a new channel
 */
export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChannelRequest) => createChannel(input),
    onSuccess: () => {
      // Invalidate my channels list
      queryClient.invalidateQueries({ queryKey: channelKeys.mine() });
    },
  });
}

/**
 * Update channel details
 */
export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, input }: { channelId: string; input: UpdateChannelRequest }) =>
      updateChannel(channelId, input),
    onSuccess: () => {
      // Update the channel in cache
      queryClient.invalidateQueries({ queryKey: channelKeys.mine() });
      // Also update the detail cache if handle is known
      queryClient.invalidateQueries({ queryKey: channelKeys.details() });
    },
  });
}

/**
 * Delete a channel
 */
export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => deleteChannel(channelId),
    onSuccess: () => {
      // Invalidate all channel queries
      queryClient.invalidateQueries({ queryKey: channelKeys.mine() });
      queryClient.invalidateQueries({ queryKey: channelKeys.lists() });
    },
  });
}
