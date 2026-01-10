import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoDescriptionProps {
  description: string | null;
  viewCount: number;
  createdAt: string;
  className?: string;
}

/**
 * Collapsible video description box.
 * Shows preview when collapsed, full content when expanded.
 */
export function VideoDescription({
  description,
  viewCount,
  createdAt,
  className,
}: VideoDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  const shouldTruncate = description.length > 200;

  return (
    <div
      className={cn(
        'bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors cursor-pointer',
        className
      )}
      onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && shouldTruncate) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      role={shouldTruncate ? 'button' : undefined}
      tabIndex={shouldTruncate ? 0 : undefined}
      aria-expanded={shouldTruncate ? isExpanded : undefined}
    >
      {/* Stats row */}
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <span>{viewCount.toLocaleString()} views</span>
        <span>•</span>
        <span>{formatRelativeDate(createdAt)}</span>
      </div>

      {/* Description text */}
      <div
        className={cn(
          'text-sm whitespace-pre-wrap',
          !isExpanded && shouldTruncate && 'line-clamp-3'
        )}
      >
        {description}
      </div>

      {/* Show more/less button */}
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
