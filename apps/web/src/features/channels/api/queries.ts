import { useQuery } from '@tanstack/react-query';
import { channelKeys } from './keys';
import { fetchChannel, fetchMyChannels, fetchChannels } from './fetchers';

// ============================================
// Single Channel Hook
// ============================================

interface UseChannelOptions {
  enabled?: boolean;
}

/**
 * Fetch channel details by handle
 * Use on channel page
 */
export function useChannel(handle: string, options: UseChannelOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: channelKeys.detail(handle),
    queryFn: () => fetchChannel(handle),
    enabled: enabled && !!handle,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// My Channels Hook
// ============================================

interface UseMyChannelsOptions {
  enabled?: boolean;
}

/**
 * Fetch current user's channels
 * Requires authentication
 */
export function useMyChannels(options: UseMyChannelsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: channelKeys.mine(),
    queryFn: fetchMyChannels,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================
// All Channels Hook
// ============================================

interface UseChannelsOptions {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Fetch all channels with pagination
 */
export function useChannels(options: UseChannelsOptions = {}) {
  const { page = 1, pageSize = 20, enabled = true } = options;

  return useQuery({
    queryKey: channelKeys.list({ page }),
    queryFn: () => fetchChannels({ page, pageSize }),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
