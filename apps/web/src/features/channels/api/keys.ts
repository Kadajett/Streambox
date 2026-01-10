/**
 * Query keys for channel-related queries
 */
export const channelKeys = {
  // Base key for all channel queries
  all: ['channels'] as const,

  // List queries
  lists: () => [...channelKeys.all, 'list'] as const,
  list: (params?: { page?: number }) => [...channelKeys.lists(), params] as const,

  // My channels (authenticated user's channels)
  mine: () => [...channelKeys.all, 'mine'] as const,

  // Single channel queries
  details: () => [...channelKeys.all, 'detail'] as const,
  detail: (handle: string) => [...channelKeys.details(), handle] as const,
};
