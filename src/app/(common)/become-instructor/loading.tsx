export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
              </div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
