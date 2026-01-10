import { Link, useLocation } from '@tanstack/react-router';
import { User, Tv, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: typeof User;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Channels', href: '/account/channels', icon: Tv },
  { label: 'Settings', href: '/account/settings', icon: Settings },
];

export function AccountNav() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start gap-3', isActive && 'bg-secondary')}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}

      <div className="pt-4 border-t mt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </nav>
  );
}
