import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
  channel: {
    name: string;
    handle: string;
    avatarUrl: string | null;
    bannerUrl?: string | null;
    description: string | null;
    subscriberCount: number;
    videoCount: number;
  };
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  isOwnChannel?: boolean;
}

export function ChannelHeader({
  channel,
  isSubscribed = false,
  onSubscribe,
  isOwnChannel = false,
}: ChannelHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div
        className={cn(
          'h-32 sm:h-48 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary',
          channel.bannerUrl && 'bg-cover bg-center'
        )}
        style={channel.bannerUrl ? { backgroundImage: `url(${channel.bannerUrl})` } : undefined}
      />

      {/* Channel info */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-4 sm:px-0">
        {/* Avatar - overlapping banner on larger screens */}
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 sm:-mt-16 border-4 border-background ring-2 ring-border">
          <AvatarImage src={channel.avatarUrl ?? undefined} alt={channel.name} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/30 to-primary/10">
            {getInitials(channel.name)}
          </AvatarFallback>
        </Avatar>

        {/* Info and actions */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{channel.name}</h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>@{channel.handle}</span>
                <span className="text-xs">???</span>
                <span>{formatCount(channel.subscriberCount)} subscribers</span>
                <span className="text-xs">???</span>
                <span>{channel.videoCount} videos</span>
              </div>
            </div>

            {/* Subscribe button */}
            {!isOwnChannel && (
              <Button
                variant={isSubscribed ? 'secondary' : 'glow'}
                onClick={onSubscribe}
                className="w-full sm:w-auto"
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Subscribed
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            )}

            {isOwnChannel && (
              <Button variant="outline" asChild>
                <a href="/account/channels">Manage channel</a>
              </Button>
            )}
          </div>

          {/* Description */}
          {channel.description && (
            <p className="text-muted-foreground line-clamp-2 max-w-2xl">
              {channel.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
