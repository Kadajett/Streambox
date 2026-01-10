import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { authKeys } from './keys';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      return response;
    },
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', credentials);

      return response;
    },
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        // Always clear tokens, even if API call fails
      }
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Optionally invalidate other user-specific queries
      queryClient.clear();
    },
  });
}
