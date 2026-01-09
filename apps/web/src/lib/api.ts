const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  visibility: 'public' | 'unlisted' | 'private';
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  channelId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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
