import type { VideoWithChannel } from '@streambox/shared-types';
import { FeedVideoCard, FeedVideoCardSkeleton } from './FeedVideoCard';

interface FeedVideoGridProps {
  videos: VideoWithChannel[];
  isLoading?: boolean;
}

/**
 * Grid layout for home page video feed.
 * Responsive: 1 column on mobile, 2 on sm, 3 on lg, 4 on xl.
 */
export function FeedVideoGrid({ videos, isLoading }: FeedVideoGridProps) {
  if (isLoading) {
    return <FeedVideoGridSkeleton count={12} />;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <FeedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}

interface FeedVideoGridSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for FeedVideoGrid
 */
export function FeedVideoGridSkeleton({ count = 8 }: FeedVideoGridSkeletonProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {Array.from({ length: count }).map((_, i) => (
          <FeedVideoCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
