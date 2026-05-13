import { Suspense } from 'react';
import { Metadata } from 'next';
import { NotificationList } from './_/components/notification-list';
import { NotificationSkeleton } from './_/components/skeletons';
import { fetchApi } from '@/lib/server-apis/server-apis';
import { Notification } from '@/types/notification';
import { getServerAuthToken } from '@/lib/server-apis/server-utils';
import { getServerQueryClient } from '@/lib/react-query/server';
import { authGuard } from '@/lib/auth';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { serverNotificationService } from '@/services/server-service-clients';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Notifications - EduLearn',
  description: 'View and manage your notifications',
};

// Server-side data fetching
export async function getInitialNotifications() {
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
  const queryClient = getServerQueryClient();
  const user = await authGuard();

  if (!user) return redirect('/auth/login');

  // Prefetch certificates
  await queryClient.prefetchInfiniteQuery({
    queryKey: QUERY_KEYS.notifications.list(user!.id, {}),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await serverNotificationService.getNotifications(
        {
          page: pageParam,
          pageSize: 12,
        },
        { signal }
      );

      if (!response.success) {
        // throw new Error(response.message || 'Failed to fetch notifications');
        return null;
      }

      return {
        notifications: response.data,
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
              <NotificationList />
            </Suspense>
          </section>
        </div>

        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
