import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useRequireAuth } from '@/features/auth';
import { AccountNav, ProfileForm, AccountSkeleton, type ProfileFormData } from './-components';

export const Route = createFileRoute('/account/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useRequireAuth({
    onUnauthenticated: () => navigate({ to: '/auth/login' }),
  });

  if (isLoading) {
    return <AccountPageLayout><AccountSkeleton /></AccountPageLayout>;
  }

  if (!isAuthenticated || !user) {
    return (
      <AccountPageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AccountPageLayout>
    );
  }

  const handleSubmit = async (data: ProfileFormData) => {
    // TODO: Implement profile update mutation
    console.log('Profile update:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <AccountPageLayout>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </AccountPageLayout>
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
