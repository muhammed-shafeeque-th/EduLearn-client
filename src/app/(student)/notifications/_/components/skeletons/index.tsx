import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Actions Skeleton */}
      <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-[32px]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2">
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>
            <Skeleton className="h-11 w-28 rounded-2xl" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-11 w-40 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Notification Items Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function NotificationItemSkeleton() {
  return (
    <div className="p-6 rounded-[32px] border-2 border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex gap-6">
        {/* Icon skeleton */}
        <Skeleton className="h-14 w-14 rounded-[22px] shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationPageSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header skeleton */}
        <div className="mb-10 lg:mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-px w-8 hidden sm:block" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="pl-1 sm:pl-11">
            <Skeleton className="h-6 w-full max-w-2xl rounded-xl" />
          </div>
        </div>

        <NotificationSkeleton />
      </div>
    </div>
  );
}
