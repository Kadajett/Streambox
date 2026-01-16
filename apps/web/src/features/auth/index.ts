// Auth Feature - Public API
export { AuthProvider, useAuth, useRequireAuth } from './context';
export { authKeys, useCurrentUser, useLogin, useRegister, useLogout } from './api';
export type {
  // User types (from shared-types)
  User,
  UserDto,
  UserSummary,
  UserProfile,
  // Auth types (from shared-types)
  AuthTokens,
  AuthResponse,
  LoginRequest,
  LoginCredentials,
  RegisterRequest,
  RegisterCredentials,
  // Web-specific types
  AuthState,
} from './types';
