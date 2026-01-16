import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Loader2,
  Upload,
  Video,
  MoreVertical,
  ExternalLink,
  Pencil,
  Trash2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VideoStatusBadge } from '@/components/video/VideoStatusBadge';
import { useChannel } from '@/features/channels';
import {
  useOwnerChannelVideos,
  useVideoThumbnailUrl,
  useDeleteChannelVideo,
} from '@/features/videos';
import { formatDistanceToNow } from 'date-fns';

export const Route = createFileRoute('/channel/$handle/studio/')({
  component: StudioVideosPage,
});

function StudioVideosPage() {
  const { handle } = Route.useParams();
  const [page, setPage] = useState(1);

  const { data: channel } = useChannel(handle);
  const {
    data: videosData,
    isLoading,
    error,
  } = useOwnerChannelVideos(channel?.id ?? '', {
    page,
    enabled: !!channel?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load videos</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const videos = videosData?.data ?? [];
  const meta = videosData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channel content</h1>
          <p className="text-muted-foreground">
            {meta?.total ?? 0} video{meta?.total !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <Button asChild variant="glow">
          <Link to="/channel/$handle/studio/upload" params={{ handle }}>
            <Upload className="h-4 w-4 mr-2" />
            Upload video
          </Link>
        </Button>
      </div>

      {/* Videos list */}
      {videos.length === 0 ? (
        <EmptyState handle={handle} />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Views</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-12.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <VideoRow key={video.id} video={video} channelId={channel?.id || ''} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

interface VideoRowProps {
  channelId: string;
  video: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    status: 'draft' | 'processing' | 'ready' | 'failed';
    moderation: 'pending' | 'approved' | 'rejected' | 'manual_review';
    visibility: 'public' | 'unlisted' | 'private';
    viewCount: number;
    slug: string | null;
    createdAt: string;
  };
}

function VideoRow({ video, channelId }: VideoRowProps) {
  const thumbnailUrl = useVideoThumbnailUrl(video.thumbnailUrl);
  const deleteVideo = useDeleteChannelVideo(channelId);
  const canWatch = video.status === 'ready';
  const isPublic = video.visibility === 'public' && video.moderation === 'approved';

  return (
    <TableRow>
      {/* Video info */}
      <TableCell>
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative w-32 shrink-0">
            <AspectRatio ratio={16 / 9}>
              <div className="w-full h-full bg-secondary rounded overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
                {video.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>
            </AspectRatio>
          </div>

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            <p className="font-medium line-clamp-1">{video.title}</p>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <VideoStatusBadge
          status={video.status}
          moderation={video.moderation}
          visibility={video.visibility}
          showVisibility={video.status === 'ready'}
        />
      </TableCell>

      {/* Views */}
      <TableCell className="hidden md:table-cell">
        <span className="text-muted-foreground">{video.viewCount.toLocaleString()}</span>
      </TableCell>

      {/* Date */}
      <TableCell className="hidden md:table-cell">
        <span className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Video actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canWatch && (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/watch/$slug" params={{ slug: video.slug || video.id }}>
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Link>
                </DropdownMenuItem>
                {isPublic && (
                  <DropdownMenuItem asChild>
                    <a
                      href={`/watch/${video.slug || video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </a>
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete this video? This action cannot be undone.'
                  )
                ) {
                  deleteVideo.mutate(video.id);
                }
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function EmptyState({ handle }: { handle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
      <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Upload your first video to get started. Your videos will appear here once uploaded.
      </p>
      <Button asChild variant="glow">
        <Link to="/channel/$handle/studio/upload" params={{ handle }}>
          <Upload className="h-4 w-4 mr-2" />
          Upload your first video
        </Link>
      </Button>
    </div>
  );
}
