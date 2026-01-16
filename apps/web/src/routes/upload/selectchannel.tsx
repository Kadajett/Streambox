import { useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Loader2, Plus, Tv2, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyChannels, getAvatarUrl } from '@/features/channels';
import { useAuth } from '@/features';

export const Route = createFileRoute('/upload/selectchannel')({
  component: SelectChannelPage,
});

function SelectChannelPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    data: channels,
    isLoading: channelsLoading,
    error,
  } = useMyChannels({
    enabled: isAuthenticated,
  });

  // Redirect logic based on channel count
  useEffect(() => {
    if (channelsLoading || authLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate({ to: '/auth/login', search: { redirect: '/upload/selectchannel' } });
      return;
    }

    // No channels - redirect to create
    if (channels && channels.length === 0) {
      navigate({ to: '/channel/create' });
      return;
    }

    // Exactly one channel - skip selection and go directly to upload
    if (channels && channels.length === 1) {
      navigate({
        to: '/channel/$handle/studio/upload',
        params: { handle: channels[0].handle },
      });
      return;
    }
  }, [channels, channelsLoading, authLoading, isAuthenticated, navigate]);

  // Loading state
  if (authLoading || channelsLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated fallback (should redirect but just in case)
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign in to upload</CardTitle>
            <CardDescription>You need to be signed in to upload videos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="glow">
              <Link to="/auth/login" search={{ redirect: '/upload/selectchannel' }}>
                Sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error loading channels</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Something went wrong'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show this UI when there are multiple channels (single channel redirects)
  if (!channels || channels.length <= 1) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Choose a channel</CardTitle>
            <CardDescription className="text-base">
              Select which channel you'd like to upload your video to
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {channels.map((channel) => (
              <button
                type="button"
                key={channel.id}
                onClick={() =>
                  navigate({
                    to: '/channel/$handle/studio/upload',
                    params: { handle: channel.handle },
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getAvatarUrl(channel.avatarUrl)} alt={channel.name} />
                  <AvatarFallback>
                    <Tv2 className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{channel.name}</p>
                  <p className="text-sm text-muted-foreground">@{channel.handle}</p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">{channel.videoCount} videos</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}

            {/* Create new channel option */}
            <div className="pt-3 border-t">
              <button
                type="button"
                onClick={() => navigate({ to: '/channel/create' })}
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-dashed hover:bg-accent transition-colors text-left group"
              >
                <div className="h-12 w-12 rounded-full border-2 border-dashed flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Create new channel</p>
                  <p className="text-sm text-muted-foreground">Start fresh with a new channel</p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
