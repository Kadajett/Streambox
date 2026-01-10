import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Loader2, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth, useRequireAuth } from '@/features/auth';
import {
  useMyChannels,
  useCreateChannel,
  useDeleteChannel,
  type Channel,
  type CreateChannelInput,
} from '@/features/channels';
import {
  AccountNav,
  ChannelCard,
  CreateChannelDialog,
  ChannelListSkeleton,
} from './-components';

export const Route = createFileRoute('/account/channels')({
  component: ChannelsPage,
});

function ChannelsPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: channels, isLoading: channelsLoading, error } = useMyChannels();
  const createChannelMutation = useCreateChannel();
  const deleteChannelMutation = useDeleteChannel();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteChannel, setDeleteChannel] = useState<Channel | null>(null);

  // Redirect to login if not authenticated
  useRequireAuth({
    onUnauthenticated: () => navigate({ to: '/auth/login' }),
  });

  const isLoading = authLoading || channelsLoading;

  const handleCreateChannel = async (data: CreateChannelInput) => {
    await createChannelMutation.mutateAsync(data);
    setCreateDialogOpen(false);
  };

  const handleEditChannel = (channel: Channel) => {
    // TODO: Open edit dialog
    console.log('Edit channel:', channel);
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannel) return;
    await deleteChannelMutation.mutateAsync(deleteChannel.id);
    setDeleteChannel(null);
  };

  if (isLoading) {
    return (
      <AccountPageLayout>
        <ChannelListSkeleton />
      </AccountPageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccountPageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AccountPageLayout>
    );
  }

  return (
    <AccountPageLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Your Channels</CardTitle>
            <CardDescription>
              Create and manage your channels
            </CardDescription>
          </div>
          <Button variant="glow" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create channel
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load channels</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Please try again later'}
              </p>
            </div>
          ) : channels && channels.length > 0 ? (
            <div className="space-y-4">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onEdit={handleEditChannel}
                  onDelete={setDeleteChannel}
                />
              ))}
            </div>
          ) : (
            <EmptyChannelsState onCreateClick={() => setCreateDialogOpen(true)} />
          )}
        </CardContent>
      </Card>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateChannel}
        isSubmitting={createChannelMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteChannel} onOpenChange={() => setDeleteChannel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete channel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteChannel?.name}</strong> and all its
              videos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChannelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete channel'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountPageLayout>
  );
}

function EmptyChannelsState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <Tv className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Create your first channel to start uploading and sharing videos with the world.
      </p>
      <Button variant="glow" onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create your first channel
      </Button>
    </div>
  );
}

/**
 * Shared layout wrapper for account pages with sidebar navigation.
 */
function AccountPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account</h1>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Sidebar navigation */}
          <aside className="hidden md:block">
            <AccountNav />
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
