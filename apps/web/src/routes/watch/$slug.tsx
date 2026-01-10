import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import { useVideo } from '@/features/videos/hooks';
import { getAvatarUrl, getHlsUrl, getThumbnailUrl } from '@/features/videos/api';
import { parseDuration } from '@/lib/utils';

export const Route = createFileRoute('/watch/$slug')({
  component: WatchPage,
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { data: video, isLoading, error } = useVideo(slug);

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-300 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-secondary rounded animate-pulse" />
        </div>
        <div className="aspect-video bg-secondary rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-secondary rounded w-3/4 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-secondary rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded w-32 animate-pulse" />
              <div className="h-3 bg-secondary rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="animate-in fade-in duration-300 space-y-6">
        <Button variant="glow" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Video not found</h1>
          <p className="text-muted-foreground mt-2">
            The video you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <Button variant="glow" asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <VideoPlayer src={getHlsUrl(video.id)} poster={getThumbnailUrl(video.thumbnailUrl)} />

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <img
              src={getAvatarUrl(video.channel.avatarUrl)}
              alt={video.channel.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{video.channel.name}</p>
              <p className="text-sm text-muted-foreground">
                {video.viewCount.toLocaleString()} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{parseDuration(video.duration || 0)}</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {video.description && (
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm whitespace-pre-wrap">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
