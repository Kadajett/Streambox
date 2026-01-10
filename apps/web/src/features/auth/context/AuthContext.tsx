import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useCurrentUser } from '../api/queries';
import { useLogin, useLogout, useRegister } from '../api/mutations';
import type { User, LoginCredentials, RegisterCredentials, AuthState } from '../types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, isFetching } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      await registerMutation.mutateAsync(credentials);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading: isLoading || isFetching,
      login,
      register,
      logout,
    }),
    [user, isLoading, isFetching, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface UseRequireAuthOptions {
  onUnauthenticated?: () => void;
}

/**
 * Hook that requires authentication.
 * Call onUnauthenticated callback when user is not authenticated (after loading).
 * Use this in routes that require authentication.
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): User | null {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onUnauthenticated } = options;

  // Only trigger callback after auth state is determined (not loading)
  if (!isLoading && !isAuthenticated && onUnauthenticated) {
    onUnauthenticated();
  }

  return user;
}
