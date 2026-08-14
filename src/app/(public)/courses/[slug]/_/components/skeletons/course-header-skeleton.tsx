import { Skeleton } from '@/components/ui/skeleton';

export function CourseHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Course Image Skeleton */}
          <Skeleton className="w-full lg:w-80 h-48 lg:h-56 rounded-lg" />

          {/* Course Info Skeleton */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>

              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />

              <Skeleton className="h-6 w-full" />
            </div>

            {/* Course Stats Skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Instructor Skeleton */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
