import { Skeleton } from '@/components/ui/skeleton';

export function CourseContentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tabs Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
        <div className="flex gap-8 py-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
