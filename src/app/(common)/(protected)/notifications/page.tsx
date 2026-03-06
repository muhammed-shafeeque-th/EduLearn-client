import { Suspense } from 'react';
import { Metadata } from 'next';
import { NotificationList } from './_/components/notification-list';
import { NotificationSkeleton } from './_/components/skeletons';
import { fetchApi } from '@/lib/server-apis/server-apis';
import { Notification } from '@/types/notification';
import { getServerAuthToken } from '@/lib/server-apis/server-utils';

export const metadata: Metadata = {
  title: 'Notifications - EduLearn',
  description: 'View and manage your notifications',
};

// Server-side data fetching
async function getInitialNotifications() {
  try {
    const token = await getServerAuthToken();

    if (!token) {
      return [];
    }

    const response = await fetchApi<Notification[]>(`notifications?page=1&pageSize=20`, {
      next: { revalidate: 0 },
      token,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch notifications');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error fetching initial notifications:', error);
    return [];
  }
}

export default async function NotificationsPage() {
  const initialNotifications = await getInitialNotifications();

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="mb-10 lg:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-blue-500 hidden sm:block" />
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl pl-1 sm:pl-11">
            Stay on top of your learning journey with real-time updates and activity logs.
          </p>
        </header>

        <section className="relative z-10">
          <Suspense fallback={<NotificationSkeleton />}>
            <NotificationList initialData={initialNotifications} />
          </Suspense>
        </section>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
