import type { Video, PaginationMeta } from '@streambox/shared-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export async function fetchVideo(videoId: string): Promise<Video> {
  const response = await fetch(`${API_BASE}/videos/${videoId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  const result: ApiResponse<Video> = await response.json();
  return result.data;
}

export async function fetchChannelVideos(
  channelId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Video>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await fetch(
    `${API_BASE}/channels/${channelId}/videos?${params}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch channel videos: ${response.statusText}`);
  }
  return response.json();
}

export function getHlsUrl(videoId: string): string {
  return `${API_BASE}/hls/${videoId}/master.m3u8`;
}

export function getThumbnailUrl(videoId: string): string {
  return `${API_BASE}/hls/thumbnails/${videoId}.jpg`;
}
