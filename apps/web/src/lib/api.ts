import type { PaginationMeta } from '@streambox/shared-types';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================
// Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// API Client
// ============================================

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = { ...options.headers };
    if (options.body && !(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle 401 - attempt refresh and retry (only once)
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/refresh')) {
      const refreshed = await this.attemptRefresh();
      if (refreshed) {
        // Retry the original request
        return this.request<T>(endpoint, options, true);
      }
      // Refresh failed - throw the original 401 error
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || `Request failed: ${response.statusText}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  /**
   * Attempt to refresh the access token.
   * Returns true if refresh succeeded, false otherwise.
   * Prevents multiple concurrent refresh requests.
   */
  private async attemptRefresh(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    p0?: { headers: { 'Content-Type': string } }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...p0,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE);

// ============================================
// Static URL Helpers
// ============================================

export function getHlsUrl(videoId: string): string {
  return `${API_BASE}/hls/${videoId}/master.m3u8`;
}

export function getThumbnailUrl(thumbnailUrl: string | null | undefined): string {
  if (!thumbnailUrl) {
    return '/video-placeholder.svg';
  }
  return `${API_BASE}${thumbnailUrl}`;
}

export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/avatar-placeholder.svg';
  }
  return avatarUrl.startsWith('http') ? avatarUrl : `${API_BASE}${avatarUrl}`;
}
