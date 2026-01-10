import { Link } from '@tanstack/react-router';
import { MoreVertical, Edit, Trash2, ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Channel } from '@/features/channels';

interface ChannelCardProps {
  channel: Channel;
  onEdit?: (channel: Channel) => void;
  onDelete?: (channel: Channel) => void;
}

export function ChannelCard({ channel, onEdit, onDelete }: ChannelCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatSubscriberCount = (count: number): string => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="group hover:bg-secondary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Channel Avatar */}
          <Link to={`/channel/${channel.handle}`}>
            <Avatar className="h-16 w-16 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarImage src={channel.avatarUrl ?? undefined} alt={channel.name} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/5">
                {getInitials(channel.name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/channel/${channel.handle}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {channel.name}
                </Link>
                <p className="text-sm text-muted-foreground">@{channel.handle}</p>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Channel options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/channel/${channel.handle}`} className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View channel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(channel)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit channel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(channel)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {channel.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {channel.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>{channel.videoCount ?? 0} videos</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatSubscriberCount(channel.subscriberCount ?? 0)} subscribers
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
