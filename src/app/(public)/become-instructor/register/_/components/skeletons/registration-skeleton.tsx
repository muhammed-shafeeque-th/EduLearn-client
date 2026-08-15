export function RegistrationSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Side Skeleton */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Side Skeleton */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

              <div className="flex justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              <div className="flex justify-between pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
