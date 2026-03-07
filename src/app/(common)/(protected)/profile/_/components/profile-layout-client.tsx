'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentUser } from '@/states/server/user/use-current-user';
import { ProfileSidebar } from './profile-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { ProfileSkeleton } from './skeletons/profile-skeleton';

interface ProfileLayoutClientProps {
  children: React.ReactNode;
}

export function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
  const { data: userData, isLoading, error } = useCurrentUser({ enabled: true });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl text-center max-w-md border border-red-100 dark:border-red-900/20">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            {error ? 'Failed to load profile' : 'Profile not found'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error
              ? 'Please check your connection and try again.'
              : "We couldn't find your profile data."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto">
        <ProfileSidebar user={userData} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header - Glassmorphism */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
              {userData.firstName?.[0]}
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Profile
            </h1>
          </div>
          <MobileSidebar user={userData} />
        </div>

        {/* Page Content with Transition */}
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  typeof children === 'object' && children !== null && 'key' in children
                    ? String(children.key)
                    : 'profile-content'
                }
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
