'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';
import { PROFILE_NAVIGATION } from '../constants';

interface ProfileSidebarProps {
  user: User;
  className?: string;
}

export const dynamic = 'force-dynamic';

export function ProfileSidebar({ user, className }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-64 min-h-screen bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
        className
      )}
    >
      <div className="p-6 h-full flex flex-col">
        {/* User Profile Header */}
        <div className="flex flex-col items-center mb-10 pt-4">
          <div className="relative group mb-4">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-emerald-500 rounded-full blur-sm opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-28 h-28">
              <Image
                src={user.avatar || '/fallback-user-avatar.jpg'}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-xl"
                sizes="112px"
                priority
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex justify-center">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider shadow-xs',
                  user.role === 'instructor'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                )}
              >
                {user.role}
              </span>
            </div>
          </div>

          {user.role === 'instructor' && user.instructorProfile?.headline && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 line-clamp-2 px-2">
              {user.instructorProfile?.headline}
            </p>
          )}
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-4" />

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1" role="navigation" aria-label="Profile navigation">
          {PROFILE_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'
                  )}
                />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-linear-to-r from-blue-600 to-blue-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
          {/* <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.2em] font-bold">
            EduLearn Platform
          </p> */}
        </div>
      </div>
    </aside>
  );
}
