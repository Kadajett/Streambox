import { Spinner } from '@/components/ui/spinner';
import { authKeys, channelKeys } from '@/features';
import { apiClient } from '@/lib/api';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { User, Channel } from '@streambox/shared-types';

export const Route = createFileRoute('/upload/')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const { queryClient } = context;
    // check if the user is logged in. Check if they have one or more channels.
    // If not, prompt them to create a channel first.
    // if they only have one channel, redirect to that channel's upload page.
    // if they have multiple channels, send them to the channel selection page.

    const user = await queryClient.ensureQueryData({
      queryKey: authKeys.user(),
      queryFn: async () => apiClient.get<User>('/auth/me'),
    });
    const channels = await queryClient.ensureQueryData({
      queryKey: channelKeys.mine(),
      queryFn: async () => apiClient.get<Channel[]>('/channels/mine'),
    });

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      });
    }

    if (!channels || channels?.length === 0) {
      throw redirect({
        to: '/channel/create',
        search: {
          redirect: location.href,
        },
      });
    }

    if (channels?.length === 1) {
      const handle = channels[0].handle;
      throw redirect({
        to: '/channel/$handle/studio/upload',
        params: { handle },
      });
    }

    if (channels.length > 1) {
      throw redirect({
        to: '/upload/selectchannel',
      });
    }

    return null;
  },
});

// check if the user is logged in. Check if they have one or more channels.
// If not, prompt them to create a channel first.
// if they only have one channel, redirect to that channel's upload page.
// if they have multiple channels, send them to the channel selection page.

function RouteComponent() {
  return (
    <>
      <Spinner className="m-auto mt-20" />
    </>
  );
}
