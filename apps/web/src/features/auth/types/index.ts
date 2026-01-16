// Re-export types from shared-types
export type {
  User,
  UserDto,
  UserSummary,
  UserProfile,
} from '@streambox/shared-types';

export type {
  AuthResponse,
  TokenPair as AuthTokens,
  // Export with both original and aliased names for flexibility
  LoginRequest,
  LoginRequest as LoginCredentials,
  RegisterRequest,
  RegisterRequest as RegisterCredentials,
} from '@streambox/shared-types';

// Import for use in local types
import type { User } from '@streambox/shared-types';

// Web-specific types (UI state, not API responses)

/**
 * Auth state for the auth context/store
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
