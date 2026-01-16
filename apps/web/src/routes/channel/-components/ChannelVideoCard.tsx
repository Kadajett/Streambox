import { Link } from '@tanstack/react-router';
import { Play, Lock, EyeOff } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getThumbnailUrl } from '@/features/videos';
import { VideoStatusIndicator } from '@/components/video/VideoStatusBadge';
import type { VideoStatus, VideoModerationStatus, VideoVisibility } from '@streambox/shared-types';
import { cn } from '@/lib/utils';

interface ChannelVideoCardProps {
  video: {
    id: string;
    slug: string | null;
    title: string;
    thumbnailUrl: string | null;
    duration: number | null;
    viewCount: number;
    createdAt: string | Date;
    // Owner-only fields (optional)
    status?: VideoStatus;
    moderation?: VideoModerationStatus;
    visibility?: VideoVisibility;
  };
  /** When true, shows status badges and handles non-ready videos */
  isOwner?: boolean;
  /** Processing progress (0-100) */
  progress?: number;
}

export function ChannelVideoCard({ video, isOwner = false, progress = 0 }: ChannelVideoCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M views`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - videoDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Determine if video is watchable
  const status = video.status ?? 'ready';
  const moderation = video.moderation ?? 'approved';
  const visibility = video.visibility ?? 'public';
  const isWatchable = status === 'ready';

  // For owners, show all videos; for public, only show approved public videos
  // Non-watchable videos for owners should not be clickable
  const CardWrapper = isWatchable ? Link : 'div';
  const watchSlug = video.slug || video.id;
  const cardProps = isWatchable
    ? { to: '/watch/$slug' as const, params: { slug: watchSlug }, className: 'group block space-y-2' }
    : { className: 'group block space-y-2 cursor-default' };

  return (
    <CardWrapper {...(cardProps as any)}>
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-xl bg-secondary">
        <AspectRatio ratio={16 / 9}>
          {video.thumbnailUrl ? (
            <img
              src={getThumbnailUrl(video.thumbnailUrl)}
              alt={video.title}
              className={cn(
                'object-cover w-full h-full transition-transform duration-300',
                isWatchable && 'group-hover:scale-105'
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-secondary">
              <Play className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </AspectRatio>

        {/* Status overlay for owners (processing, failed, pending) */}
        {isOwner && (
          <VideoStatusIndicator
            status={status}
            moderation={moderation}
            progress={progress}
          />
        )}

        {/* Visibility indicator for owners (unlisted/private - only when ready and approved) */}
        {isOwner && isWatchable && moderation === 'approved' && visibility !== 'public' && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
              {visibility === 'private' ? (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>Unlisted</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Duration badge - hide when processing/failed overlay is shown */}
        {(!isOwner || isWatchable) && video.duration != null && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Hover overlay - only for watchable videos */}
        {isWatchable && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Video info */}
      <div className="space-y-1">
        <h3 className={cn(
          'font-medium line-clamp-2 transition-colors',
          isWatchable && 'group-hover:text-primary'
        )}>
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatViewCount(video.viewCount)} • {getRelativeTime(video.createdAt)}
        </p>
      </div>
    </CardWrapper>
  );
}
