import { Video } from 'lucide-react';
import { ChannelVideoCard } from './ChannelVideoCard';

interface Video {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number;
  viewCount: number;
  createdAt: string | Date;
}

interface ChannelVideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ChannelVideoGrid({
  videos,
  isLoading = false,
  emptyMessage = 'No videos yet',
}: ChannelVideoGridProps) {
  if (isLoading) {
    return <ChannelVideoGridSkeleton />;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Video className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <ChannelVideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function ChannelVideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="aspect-video bg-secondary rounded-xl" />
          <div className="h-5 bg-secondary rounded w-3/4" />
          <div className="h-4 bg-secondary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
