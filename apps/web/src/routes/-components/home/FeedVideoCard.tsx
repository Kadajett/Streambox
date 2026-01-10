import { Link } from '@tanstack/react-router';
import type { VideoWithChannel } from '@streambox/shared-types';
import { getThumbnailUrl, getAvatarUrl } from '@/lib/api';
import { parseDuration } from '@/lib/utils';

interface FeedVideoCardProps {
  video: VideoWithChannel;
}

/**
 * Video card specifically designed for the home page feed grid.
 * Features: thumbnail with hover effects, channel avatar, duration badge.
 */
export function FeedVideoCard({ video }: FeedVideoCardProps) {
  return (
    <article>
      <Link
        to="/watch/$slug"
        params={{ slug: video.slug ?? video.id }}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
        aria-label={`Watch ${video.title} by ${video.channel.name}`}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-3">
          <img
            src={getThumbnailUrl(video.thumbnailUrl)}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 ring-2 ring-primary/50 rounded-xl" />
            <div className="absolute inset-0 shadow-[0_0_30px_rgba(245,158,11,0.3)]" />
          </div>

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs font-mono text-white">
              <span className="sr-only">Duration: </span>
              {parseDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="shrink-0">
            <img
              src={getAvatarUrl(video.channel.avatarUrl)}
              alt=""
              aria-hidden="true"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 group-focus-visible:ring-primary/50 transition-all"
              loading="lazy"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary group-focus-visible:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 truncate">
              {video.channel.name}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {video.viewCount.toLocaleString()} views •{' '}
              {formatRelativeTime(video.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Skeleton loader for FeedVideoCard
 */
export function FeedVideoCardSkeleton() {
  return (
    <article className="animate-pulse" aria-busy="true" aria-label="Loading video">
      <div className="relative aspect-video rounded-xl bg-secondary mb-3" />
      <div className="flex gap-3">
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-full bg-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
          <div className="h-3 bg-secondary rounded w-1/2 mb-1" />
          <div className="h-3 bg-secondary rounded w-1/3" />
        </div>
      </div>
    </article>
  );
}

/**
 * Format a date string as relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
