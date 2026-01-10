import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title: string;
  viewCount: number;
  createdAt: string;
  likeCount?: number;
  dislikeCount?: number;
  className?: string;
}

/**
 * Video title and action buttons (like, share, save) for the watch page.
 */
export function VideoInfo({
  title,
  viewCount,
  createdAt,
  likeCount = 0,
  dislikeCount = 0,
  className,
}: VideoInfoProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h1 className="text-xl font-bold leading-tight sm:text-2xl">{title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View count and date */}
        <div className="text-sm text-muted-foreground">
          {viewCount.toLocaleString()} views • {formatDate(createdAt)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Like/Dislike group */}
          <div className="flex items-center bg-secondary rounded-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                'rounded-l-full rounded-r-none gap-2 px-4',
                isLiked && 'text-primary'
              )}
            >
              <ThumbsUp className={cn('h-4 w-4', isLiked && 'fill-current')} />
              <span>{formatCount(likeCount + (isLiked ? 1 : 0))}</span>
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={cn(
                'rounded-r-full rounded-l-none px-4',
                isDisliked && 'text-primary'
              )}
            >
              <ThumbsDown className={cn('h-4 w-4', isDisliked && 'fill-current')} />
            </Button>
          </div>

          {/* Share button */}
          <Button variant="secondary" size="sm" onClick={handleShare} className="rounded-full gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {/* Save button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSaved(!isSaved)}
            className={cn('rounded-full gap-2', isSaved && 'text-primary')}
          >
            <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </Button>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Flag className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report video</DropdownMenuItem>
              <DropdownMenuItem>Not interested</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
