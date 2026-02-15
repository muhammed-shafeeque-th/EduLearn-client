'use client';

import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/shared/theme-button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import React from 'react';

function getInitials(name?: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function InstructorHeader() {
  const { logout, user, isAuthenticated } = useAuth();

  // Best: mobile first + single flex-row, center brand, align actions right
  return (
    <header className="bg-background border-b border-border px-4 sm:px-6 py-2 sm:py-4 w-full sticky top-0 z-40 transition-shadow backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between relative min-h-[56px]">
        {/* Left Spacer for symmetry on desktop, mobile only shows menu if available */}
        <div className="flex items-center min-w-[72px]">
          <div className="sm:hidden flex items-center gap-2">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar || './fallback-avatar.png'}
                        alt={user?.username}
                      />
                      <AvatarFallback>{getInitials(user?.username) || 'AS'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile" passHref legacyBehavior>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Centered Brand/Title */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-1 justify-center">
          {/* Brand/Title */}
          <Link
            href="/instructor"
            className="flex items-center gap-2 select-none"
            tabIndex={0}
            aria-label="Instructor Dashboard Home"
          >
            <span className="font-semibold text-base tracking-tight text-foreground">
              Instructor Dashboard
            </span>
          </Link>
        </div>

        {/* Actions (theme, help, user menu desktop) */}
        <div className="flex items-center min-w-[120px] justify-end space-x-1 sm:space-x-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help & Support"
            className="hover:bg-muted focus:bg-accent transition"
            tabIndex={0}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          {/* Student button */}
          <Link href="/profile" passHref legacyBehavior>
            <Button variant="outline" size="sm" className="ml-1" aria-label="Go to Student Profile">
              Student
            </Button>
          </Link>
          {/* User menu on desktop */}
          {isAuthenticated && (
            <div className="hidden sm:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar || './fallback-avatar.png'}
                        alt={user?.username}
                      />
                      <AvatarFallback>{getInitials(user?.username) || 'AS'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
