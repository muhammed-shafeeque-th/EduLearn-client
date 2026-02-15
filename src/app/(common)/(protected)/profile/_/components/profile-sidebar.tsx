'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
import { cn, getNavigator } from '@/lib/utils';
import { PROFILE_NAVIGATION } from '../constants';

interface ProfileSidebarProps {
  user: User;
  className?: string;
}

export const dynamic = 'force-dynamic';

export function ProfileSidebar({ user, className }: ProfileSidebarProps) {
  const pathname = usePathname();

  const handleShare = async () => {
    try {
      if (getNavigator()?.share) {
        await getNavigator()?.share({
          title: `${user.firstName} ${user.lastName} `,
          text: 'Check out this profile on EduLearn',
          url: window.location.href,
        });
      } else {
        await getNavigator()?.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <aside
      className={cn(
        'w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        className
      )}
    >
      <div className="p-6">
        {/* User Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={user.avatar || '/fallback-user-avatar.jpg'}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              className="rounded-full object-cover"
              sizes="128px"
              priority
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {user.firstName} {user.lastName}
          </h2>

          {user.role == 'instructor' && user.instructorProfile?.headline && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {user.instructorProfile?.headline}
            </p>
          )}

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Profile
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2" role="navigation" aria-label="Profile navigation">
          {PROFILE_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
