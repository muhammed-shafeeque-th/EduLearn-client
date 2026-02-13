// app/notifications/_components/notification-skeleton.tsx

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Actions Skeleton */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Tabs skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </Card>

      {/* Notification Items Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function NotificationItemSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex gap-4">
        {/* Icon skeleton */}
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />

          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NotificationPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <NotificationSkeleton />
      </div>
    </div>
  );
}
