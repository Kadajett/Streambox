import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChannel } from '@/features/channels';
import { useChannelVideos } from '@/features/videos';
import { useAuth } from '@/features/auth';
import { ChannelHeader, ChannelVideoGrid, ChannelPageSkeleton } from '../-components';

export const Route = createFileRoute('/channel/$handle/')({
  component: ChannelPage,
});

function ChannelPage() {
  const { handle } = Route.useParams();
  const { user } = useAuth();
  const { data: channel, isLoading: channelLoading, error: channelError } = useChannel(handle);
  const { data: videosData, isLoading: videosLoading } = useChannelVideos(channel?.id ?? '', {
    enabled: !!channel?.id,
  });

  if (channelLoading) {
    return <ChannelPageSkeleton />;
  }

  if (channelError || !channel) {
    return <ChannelNotFound />;
  }

  // Check if this is the user's own channel
  const isOwnChannel = user?.id === channel.ownerId;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>

      {/* Channel header */}
      <ChannelHeader
        channel={{
          name: channel.name,
          handle: channel.handle,
          avatarUrl: channel.avatarUrl,
          description: channel.description,
          subscriberCount: channel.subscriberCount ?? 0,
          videoCount: channel.videoCount ?? 0,
        }}
        isOwnChannel={isOwnChannel}
      />

      {/* Tabs */}
      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-6">
          <ChannelVideoGrid
            videos={videosData?.data ?? []}
            isLoading={videosLoading}
            emptyMessage="This channel hasn't uploaded any videos yet"
          />
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="text-center py-16 text-muted-foreground">No playlists yet</div>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutTab channel={channel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  subscriberCount?: number;
  videoCount?: number;
  createdAt: string | Date;
}

function AboutTab({ channel }: { channel: Channel }) {
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {channel.description || 'No description provided'}
        </p>
      </div>

      {/* Stats */}
      <div>
        <h3 className="font-semibold mb-2">Stats</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Joined</dt>
            <dd className="font-medium">{formatDate(channel.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total views</dt>
            <dd className="font-medium">--</dd>
          </div>
        </dl>
      </div>

      {/* Links */}
      <div>
        <h3 className="font-semibold mb-2">Links</h3>
        <p className="text-muted-foreground text-sm">No links added</p>
      </div>
    </div>
  );
}

function ChannelNotFound() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-destructive mb-2">Channel not found</h1>
        <p className="text-muted-foreground">
          The channel you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="glow" asChild className="mt-6">
          <Link to="/">Browse channels</Link>
        </Button>
      </div>
    </div>
  );
}
