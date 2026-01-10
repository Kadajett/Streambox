import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { useVideo, getHlsUrl, getThumbnailUrl } from '@/features/videos';
import {
  VideoInfo,
  ChannelInfo,
  VideoDescription,
  WatchPageSkeleton,
} from '../-components/watch';

export const Route = createFileRoute('/watch/$slug')({
  component: WatchPage,
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { data: video, isLoading, error } = useVideo(slug);

  if (isLoading) {
    return <WatchPageSkeleton />;
  }

  if (error || !video) {
    return <VideoNotFound />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Main content area */}
      <div className="max-w-[1280px] mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Video player */}
        <div className="mb-4">
          <VideoPlayer
            src={getHlsUrl(video.id)}
            poster={getThumbnailUrl(video.thumbnailUrl)}
            className="aspect-video w-full"
          />
        </div>

        {/* Video info section */}
        <div className="space-y-4 px-4 sm:px-0">
          {/* Title and actions */}
          <VideoInfo
            title={video.title}
            viewCount={video.viewCount}
            createdAt={video.createdAt}
            likeCount={0}
            dislikeCount={0}
          />

          {/* Channel info */}
          <ChannelInfo
            channel={{
              id: video.channel.id,
              handle: video.channel.handle,
              name: video.channel.name,
              avatarUrl: video.channel.avatarUrl,
              subscriberCount: video.channel.subscriberCount,
            }}
          />

          {/* Description */}
          <VideoDescription
            description={video.description}
            viewCount={video.viewCount}
            createdAt={video.createdAt}
          />
        </div>
      </div>
    </div>
  );
}

function VideoNotFound() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-destructive mb-2">Video not found</h1>
        <p className="text-muted-foreground">
          The video you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="glow" asChild className="mt-6">
          <Link to="/">Browse videos</Link>
        </Button>
      </div>
    </div>
  );
}
