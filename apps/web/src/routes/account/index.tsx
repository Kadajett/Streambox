import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/account/')({
  component: AccountIndexPage,
});

/**
 * Account index redirects to the profile page by default.
 */
function AccountIndexPage() {
  return <Navigate to="/account/profile" replace />;
}
