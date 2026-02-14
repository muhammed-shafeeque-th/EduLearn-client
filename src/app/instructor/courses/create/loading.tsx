export default function CourseCreatorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tab Navigation Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-between">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex space-x-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
