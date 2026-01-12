import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api';
import { authKeys } from './keys';
import type { User } from '@streambox/shared-types';

/**
 * Fetch current authenticated user
 */
async function fetchCurrentUser(): Promise<User> {
  return apiClient.get<User>('/auth/me');
}

/**
 * Hook to get current user
 * Only enabled when we have a token stored
 */
export function useCurrentUser() {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
