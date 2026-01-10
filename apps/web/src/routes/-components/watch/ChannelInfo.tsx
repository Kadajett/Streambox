import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ChannelInfoProps {
  channel: {
    id: string;
    handle: string;
    name: string;
    avatarUrl: string | null;
    subscriberCount?: number;
  };
  className?: string;
}

/**
 * Channel info section with avatar, name, subscriber count, and subscribe button.
 */
export function ChannelInfo({ channel, className }: ChannelInfoProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      setHasNotifications(true);
    }
  };

  const toggleNotifications = () => {
    setHasNotifications(!hasNotifications);
  };

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Channel info */}
      <Link
        to="/channel/$handle"
        params={{ handle: channel.handle }}
        className="flex items-center gap-3 group"
      >
        <img
          src={getAvatarUrl(channel.avatarUrl)}
          alt={channel.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
        />
        <div className="min-w-0">
          <p className="font-medium truncate group-hover:text-primary transition-colors">
            {channel.name}
          </p>
          {channel.subscriberCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {formatSubscriberCount(channel.subscriberCount)} subscribers
            </p>
          )}
        </div>
      </Link>

      {/* Subscribe actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isSubscribed ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleNotifications}
              className={cn(
                'rounded-full',
                hasNotifications && 'text-primary'
              )}
            >
              {hasNotifications ? (
                <Bell className="h-4 w-4 fill-current" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubscribe}
              className="rounded-full gap-2"
            >
              <Check className="h-4 w-4" />
              Subscribed
            </Button>
          </>
        ) : (
          <Button
            variant="glow"
            size="sm"
            onClick={handleSubscribe}
            className="rounded-full"
          >
            Subscribe
          </Button>
        )}
      </div>
    </div>
  );
}

function formatSubscriberCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
