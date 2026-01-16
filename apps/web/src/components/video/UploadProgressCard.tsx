import { Link } from '@tanstack/react-router';
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import type { VideoStatus, VideoModerationStatus } from '@streambox/shared-types';

interface UploadProgressCardProps {
  videoId: string;
  title: string;
  thumbnailUrl?: string | null;
  status: VideoStatus;
  moderation: VideoModerationStatus;
  progress?: number;
  uploadProgress?: number;
  isUploading?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function UploadProgressCard({
  videoId,
  title,
  thumbnailUrl,
  status,
  moderation,
  progress = 0,
  uploadProgress = 100,
  isUploading = false,
  onRetry,
  className,
}: UploadProgressCardProps) {
  const getStatusInfo = () => {
    if (isUploading) {
      return {
        icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
        label: 'Uploading...',
        description: `${uploadProgress}% uploaded`,
        color: 'text-blue-500',
        showProgress: true,
        progressValue: uploadProgress,
      };
    }

    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
          label: 'Processing',
          description: progress > 0 ? `${progress}% complete` : 'Transcoding video...',
          color: 'text-primary',
          showProgress: true,
          progressValue: progress,
        };
      case 'failed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: 'Failed',
          description: 'Processing failed. Please try again.',
          color: 'text-red-500',
          showProgress: false,
          progressValue: 0,
        };
      case 'ready':
        if (moderation === 'pending') {
          return {
            icon: <Clock className="h-5 w-5 text-yellow-500" />,
            label: 'Pending Review',
            description: 'Waiting for moderation approval',
            color: 'text-yellow-500',
            showProgress: false,
            progressValue: 100,
          };
        }
        if (moderation === 'approved') {
          return {
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            label: 'Live',
            description: 'Your video is publicly available',
            color: 'text-green-500',
            showProgress: false,
            progressValue: 100,
          };
        }
        if (moderation === 'rejected') {
          return {
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            label: 'Rejected',
            description: 'Video did not pass moderation',
            color: 'text-red-500',
            showProgress: false,
            progressValue: 0,
          };
        }
        return {
          icon: <Clock className="h-5 w-5 text-orange-500" />,
          label: 'Under Review',
          description: 'Being reviewed by moderators',
          color: 'text-orange-500',
          showProgress: false,
          progressValue: 100,
        };
      case 'draft':
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          label: 'Draft',
          description: 'Video saved as draft',
          color: 'text-gray-500',
          showProgress: false,
          progressValue: 0,
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          label: 'Unknown',
          description: 'Status unknown',
          color: 'text-gray-500',
          showProgress: false,
          progressValue: 0,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const canWatch = status === 'ready' && moderation === 'approved';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-40 shrink-0">
            <AspectRatio ratio={16 / 9}>
              <div className="w-full h-full bg-secondary rounded-lg overflow-hidden">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {/* Overlay for non-ready states */}
                {(status === 'processing' || isUploading) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            </AspectRatio>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-medium line-clamp-1">{title}</h3>
              <div className={cn('flex items-center gap-2 mt-1', statusInfo.color)}>
                {statusInfo.icon}
                <span className="text-sm font-medium">{statusInfo.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{statusInfo.description}</p>
            </div>

            {/* Progress bar */}
            {statusInfo.showProgress && (
              <div className="mt-3">
                <Progress value={statusInfo.progressValue} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {canWatch && (
                <Button size="sm" variant="outline" asChild>
                  <Link to="/watch/$slug" params={{ slug: videoId }}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              )}
              {status === 'failed' && onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal version for lists
interface UploadProgressItemProps {
  title: string;
  status: VideoStatus;
  progress?: number;
  className?: string;
}

export function UploadProgressItem({
  title,
  status,
  progress = 0,
  className,
}: UploadProgressItemProps) {
  const isProcessing = status === 'processing';
  const isFailed = status === 'failed';

  return (
    <div className={cn('flex items-center gap-3 py-2', className)}>
      {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
      {isFailed && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
      {status === 'ready' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {isProcessing && (
          <Progress value={progress} className="h-1 mt-1" />
        )}
      </div>

      {isProcessing && progress > 0 && (
        <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
      )}
    </div>
  );
}
