'use client';

import React, { useCallback, useMemo } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminSelector, useAppDispatch } from '@/states/client';
import { toast, commonToasts } from '@/hooks/use-toast';
import { adminLogout } from '@/states/client/slices/admin-slice';

export function AdminHeader() {
  const { admin } = useAdminSelector();
  const dispatch = useAppDispatch();

  /**
   * Handles admin logout.
   * Memoized for best performance, especially relevant when passed to children.
   */
  const handleLogout = useCallback(async () => {
    // if (!admin?.email) {
    //   toast.warning({ title: "Can't logout", description: 'Admin not found.' });
    //   return;
    // }
    const result = await dispatch(adminLogout());
    if (result.meta.requestStatus === 'rejected') {
      toast.error({ title: 'Logout failed', description: result.payload as string });
      return;
    }
    commonToasts.logoutSuccess();
  }, [dispatch]);

  /**
   * Memoized user display info for efficient rendering.
   */
  const { displayName, email, avatarInitials } = useMemo(() => {
    const name = admin?.name?.trim() || 'Admin User';
    const emailAddr = admin?.email || 'admin@edulearn.com';
    // Avatar image is static, as admin info does not provide avatar
    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AD';
    return { displayName: name, email: emailAddr, avatarInitials: initials };
  }, [admin?.name, admin?.email]);

  const avatarSrc = '/avatars/admin.png';

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search bar */}
        <div className="relative flex flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <Input
            className="pl-10 sm:w-96"
            placeholder="Search..."
            type="search"
            aria-label="Search"
            // Best: avoid uncontrolled Input, consider controlling via useState if needed
          />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme toggle button */}
          <ThemeToggle />
          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          {/* Divider */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-800" />
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                aria-label="User menu"
                type="button"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc} alt={displayName} />
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem role="menuitem">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
                role="menuitem"
                tabIndex={0}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
