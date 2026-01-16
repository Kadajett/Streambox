import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import { Loader2, Upload, Video, BarChart3, Settings, ChevronLeft, Tv2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChannel, getAvatarUrl } from '@/features/channels';
import { useAuth } from '@/features';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/channel/$handle/studio')({
  component: StudioLayout,
});

const sidebarItems = [
  {
    label: 'Content',
    href: (handle: string) => `/channel/${handle}/studio`,
    icon: Video,
    exact: true,
  },
  {
    label: 'Upload',
    href: (handle: string) => `/channel/${handle}/studio/upload`,
    icon: Upload,
  },
  {
    label: 'Analytics',
    href: (handle: string) => `/channel/${handle}/studio/analytics`,
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: (handle: string) => `/channel/${handle}/studio/settings`,
    icon: Settings,
  },
];

function StudioLayout() {
  const { handle } = Route.useParams();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: channel, isLoading: channelLoading, error } = useChannel(handle);

  // Loading state
  if (authLoading || channelLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="text-muted-foreground">You need to be signed in to access the studio.</p>
        <Button asChild variant="glow">
          <Link to="/auth/login" search={{ redirect: `/channel/${handle}/studio` }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  // Channel not found
  if (error || !channel) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Channel not found</h1>
        <p className="text-muted-foreground">
          This channel doesn't exist or you don't have access to it.
        </p>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  console.log('Studio Page Auth ', isAuthenticated, ' User: ', user, ' Channel: ', channel);

  // Check if user owns this channel
  if (channel.userId !== user?.id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage this channel.</p>
        <Button asChild>
          <Link to="/channel/$handle" params={{ handle }}>
            View channel
          </Link>
        </Button>
      </div>
    );
  }

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href || location.pathname === `${href}/`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] -mx-4 -my-6">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card shrink-0 hidden md:flex flex-col">
        {/* Channel info */}
        <div className="p-4 border-b">
          <Link to="/channel/$handle" params={{ handle }} className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getAvatarUrl(channel.avatarUrl)} alt={channel.name} />
              <AvatarFallback>
                <Tv2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {channel.name}
              </p>
              <p className="text-xs text-muted-foreground">@{channel.handle}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const href = item.href(handle);
              const active = isActive(href, item.exact);

              return (
                <li key={item.label}>
                  <Link
                    to={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to channel */}
        <div className="p-4 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link to="/channel/$handle" params={{ handle }}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to channel
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-14 left-0 right-0 bg-background border-b z-40">
        <div className="flex items-center gap-2 p-2 overflow-x-auto">
          <Link to="/channel/$handle" params={{ handle }}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {channel.name}
            </Button>
          </Link>
          <div className="flex items-center gap-1">
            {sidebarItems.map((item) => {
              const href = item.href(handle);
              const active = isActive(href, item.exact);

              return (
                <Link key={item.label} to={href}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(active && 'bg-primary/10 text-primary')}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 md:mt-0 mt-14">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
