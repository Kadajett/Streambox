import { Video, Upload } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ChannelVideoCard } from './ChannelVideoCard';
import type { VideoStatus, VideoModerationStatus, VideoVisibility } from '@streambox/shared-types';

interface VideoItem {
  id: string;
  slug: string | null;
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  createdAt: string | Date;
  // Owner-only fields
  status?: VideoStatus;
  moderation?: VideoModerationStatus;
  visibility?: VideoVisibility;
}

interface ChannelVideoGridProps {
  videos: VideoItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** When true, shows status badges and owner controls */
  isOwner?: boolean;
  /** Channel handle for upload link */
  channelHandle?: string;
}

export function ChannelVideoGrid({
  videos,
  isLoading = false,
  emptyMessage = 'No videos yet',
  isOwner = false,
  channelHandle,
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
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {isOwner && channelHandle && (
          <Button asChild variant="glow">
            <Link to="/channel/$handle/studio/upload" params={{ handle: channelHandle }}>
              <Upload className="h-4 w-4 mr-2" />
              Upload your first video
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <ChannelVideoCard key={video.id} video={video} isOwner={isOwner} />
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
