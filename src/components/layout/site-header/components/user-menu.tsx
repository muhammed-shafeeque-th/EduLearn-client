'use client';

import {
  User,
  Settings,
  BookOpen,
  Heart,
  ShoppingCart,
  LogOut,
  Bell,
  GraduationCap,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { AuthUser } from '@/types/auth';
import { useCallback, memo } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import { getUserRole } from '@/lib/utils/user.utils';

interface UserMenuProps {
  user: AuthUser;
}

const getInitials = (name: string = ''): string => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

const menuItems = [
  {
    href: ROUTES.student.profile.root,
    label: 'Profile',
    icon: User,
    'data-testid': 'user-menu-profile',
  },
  {
    href: ROUTES.student.profile.courses.root,
    label: 'My Learning',
    icon: BookOpen,
    'data-testid': 'user-menu-learning',
  },
  {
    href: ROUTES.student.wishlist,
    label: 'Wishlist',
    icon: Heart,
    'data-testid': 'user-menu-wishlist',
  },
  { href: ROUTES.student.cart, label: 'Cart', icon: ShoppingCart, 'data-testid': 'user-menu-cart' },
  {
    href: ROUTES.student.notifications,
    label: 'Notifications',
    icon: Bell,
    'data-testid': 'user-menu-notifications',
  },
];

export const UserMenu = memo(function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const role = getUserRole(user);

  const handleLogout = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      logout();
    },
    [logout]
  );

  const avatarSrc = user?.avatar || '/images/fallback-user-avatar.jpg';
  const avatarAlt = user?.username || 'User avatar';
  const initials = getInitials(user?.username);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={avatarAlt} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 shadow-xl border-border/50 backdrop-blur-sm"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-1 p-3 leading-none rounded-lg bg-muted/30 mb-2">
          <p className="font-bold text-sm">{user?.username || 'User'}</p>
          <p className="truncate text-xs text-muted-foreground opacity-80">{user?.email}</p>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="space-y-1">
          {menuItems.map(({ href, label, icon: Icon, ...props }) => (
            <DropdownMenuItem asChild key={href} {...props} className="rounded-md">
              <Link
                href={href}
                className="cursor-pointer flex items-center w-full py-2 hover:bg-muted transition-colors"
              >
                <Icon className="mr-3 h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Role-based dashboard link — previously only present in the
            mobile menu, so instructors/admins had no way to reach their
            dashboard from the desktop header at all. */}
        {(role === 'instructor' || role === 'admin' || role === 'student') && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <div className="space-y-1">
              {role === 'instructor' && (
                <DropdownMenuItem asChild className="rounded-md">
                  <Link
                    href={ROUTES.instructor.root}
                    className="cursor-pointer flex items-center w-full py-2 hover:bg-primary/10 text-primary transition-colors"
                  >
                    <GraduationCap className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Instructor Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {role === 'admin' && (
                <DropdownMenuItem asChild className="rounded-md">
                  <Link
                    href={ROUTES.admin.root}
                    className="cursor-pointer flex items-center w-full py-2 hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {role === 'student' && (
                <DropdownMenuItem asChild className="rounded-md">
                  <Link
                    href={ROUTES.public.becomeInstructor.root}
                    className="cursor-pointer flex items-center w-full py-2 hover:bg-primary/10 text-primary transition-colors"
                  >
                    <GraduationCap className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Teach on EduLearn</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </div>
          </>
        )}

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem asChild className="rounded-md">
          <Link
            href={ROUTES.student.profile.security}
            className="cursor-pointer flex items-center w-full py-2 hover:bg-muted transition-colors"
          >
            <Settings className="mr-3 h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 rounded-md py-2"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserMenu.displayName = 'UserMenu';
