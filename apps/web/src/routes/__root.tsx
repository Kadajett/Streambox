import { Suspense, lazy } from 'react';
import { Link, Outlet, createRootRoute, useNavigate } from '@tanstack/react-router';
import { Search, Upload, User, Settings, Tv, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthProvider, useAuth } from '@/features/auth';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}

function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Outlet />
        </main>
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </div>
    </AuthProvider>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center gap-4 mx-auto px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity shrink-0">
          StreamBox
        </Link>

        {/* Search bar - hidden on mobile */}
        <div className="hidden sm:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search videos..." className="pl-10 pr-4" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          <UserActions />
        </div>
      </div>
    </header>
  );
}

function UserActions() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/auth/login">Sign in</Link>
        </Button>
        <Button variant="glow" size="sm" asChild>
          <Link to="/auth/register">Sign up</Link>
        </Button>
      </>
    );
  }

  // Authenticated user
  return (
    <>
      {/* Upload button */}
      <Button variant="ghost" size="icon" className="hidden sm:flex">
        <Upload className="h-5 w-5" />
        <span className="sr-only">Upload video</span>
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={user.displayName || user.username}
              />
              <AvatarFallback className="text-xs">
                {getInitials(user.displayName || user.username)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || user.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/account/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/account/channels" className="flex items-center">
              <Tv className="mr-2 h-4 w-4" />
              Your channels
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/account/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
