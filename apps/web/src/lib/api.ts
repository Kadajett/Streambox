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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = { ...options.headers };
    if (options.body) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

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

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
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
