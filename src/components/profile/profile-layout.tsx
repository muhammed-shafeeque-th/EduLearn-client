'use client';

import { ReactNode } from 'react';
import { ProfileSidebar } from '../../app/(common)/(protected)/profile/_/components/profile-sidebar';
import MobileProfileMenu from './mobile-profileMenu';
import type { User } from '@/types/user';

interface ProfileLayoutProps {
  user: User;
  children: ReactNode;
}

export default function ProfileLayout({ user, children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h1>
          <MobileProfileMenu user={user} />
        </div>
      </div>

      <div className="flex">
        <div className="hidden lg:block">
          <ProfileSidebar user={user} />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
