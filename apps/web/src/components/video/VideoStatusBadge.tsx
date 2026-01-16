import { Loader2, Clock, CheckCircle, XCircle, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { VideoStatus, VideoModerationStatus, VideoVisibility } from '@streambox/shared-types';

interface VideoStatusBadgeProps {
  status: VideoStatus;
  moderation?: VideoModerationStatus;
  visibility?: VideoVisibility;
  progress?: number;
  showVisibility?: boolean;
  className?: string;
}

export function VideoStatusBadge({
  status,
  moderation = 'pending',
  visibility = 'private',
  progress = 0,
  showVisibility = false,
  className,
}: VideoStatusBadgeProps) {
  // Processing state takes priority
  if (status === 'processing') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
        {progress > 0 && (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        )}
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <Badge variant="destructive" className={cn('gap-1.5', className)}>
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  }

  // Draft state
  if (status === 'draft') {
    return (
      <Badge variant="outline" className={cn('gap-1.5', className)}>
        <Clock className="h-3 w-3" />
        Draft
      </Badge>
    );
  }

  // Ready state - show moderation status
  if (status === 'ready') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        <ModerationBadge moderation={moderation} />
        {showVisibility && <VisibilityBadge visibility={visibility} />}
      </div>
    );
  }

  return null;
}

function ModerationBadge({ moderation }: { moderation: VideoModerationStatus }) {
  switch (moderation) {
    case 'pending':
      return (
        <Badge variant="secondary" className="gap-1.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="secondary" className="gap-1.5 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1.5">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case 'manual_review':
      return (
        <Badge variant="secondary" className="gap-1.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">
          <AlertTriangle className="h-3 w-3" />
          Under Review
        </Badge>
      );
    default:
      return null;
  }
}

function VisibilityBadge({ visibility }: { visibility: VideoVisibility }) {
  switch (visibility) {
    case 'public':
      return (
        <Badge variant="outline" className="gap-1.5">
          <Eye className="h-3 w-3" />
          Public
        </Badge>
      );
    case 'unlisted':
      return (
        <Badge variant="outline" className="gap-1.5">
          <EyeOff className="h-3 w-3" />
          Unlisted
        </Badge>
      );
    case 'private':
      return (
        <Badge variant="outline" className="gap-1.5">
          <Lock className="h-3 w-3" />
          Private
        </Badge>
      );
    default:
      return null;
  }
}

// Compact version for video cards
interface VideoStatusIndicatorProps {
  status: VideoStatus;
  moderation?: VideoModerationStatus;
  progress?: number;
  className?: string;
}

export function VideoStatusIndicator({
  status,
  moderation = 'pending',
  progress = 0,
  className,
}: VideoStatusIndicatorProps) {
  if (status === 'processing') {
    return (
      <div className={cn('absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="text-white text-sm font-medium">Processing</span>
        {progress > 0 && (
          <div className="w-24">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={cn('absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2', className)}>
        <XCircle className="h-8 w-8 text-red-500" />
        <span className="text-white text-sm font-medium">Failed</span>
      </div>
    );
  }

  if (status === 'ready' && moderation === 'pending') {
    return (
      <div className={cn('absolute top-2 left-2', className)}>
        <Badge variant="secondary" className="bg-yellow-500/90 text-yellow-950 text-xs">
          Pending
        </Badge>
      </div>
    );
  }

  if (status === 'ready' && moderation === 'rejected') {
    return (
      <div className={cn('absolute top-2 left-2', className)}>
        <Badge variant="destructive" className="text-xs">
          Rejected
        </Badge>
      </div>
    );
  }

  return null;
}
