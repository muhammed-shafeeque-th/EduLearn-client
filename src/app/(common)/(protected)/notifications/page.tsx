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
    <div className="min-h-screen bg-background">
      {/* Mobile-first: smaller padding, max-w-full by default, increase on larger screens */}
      <div className="w-full max-w-full px-2 pt-4 pb-8 mx-auto sm:px-4 md:max-w-2xl lg:max-w-5xl md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Stay updated with your latest activities and announcements
          </p>
        </div>
        <Suspense fallback={<NotificationSkeleton />}>
          <NotificationList initialData={initialNotifications} />
        </Suspense>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
