import { Skeleton } from '@/components/ui/skeleton';

export function NotFoundSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/50 via-white to-primary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Skeleton */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-24 h-6" />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-4" />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <Skeleton className="w-32 h-16 md:w-48 md:h-24" />
              <Skeleton className="w-full h-10" />
              <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>

              {/* Search Skeleton */}
              <div className="p-4 border rounded-lg">
                <Skeleton className="w-full h-10" />
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="w-24 h-10" />
                <Skeleton className="w-24 h-10" />
                <Skeleton className="w-24 h-10" />
              </div>

              {/* Links Skeleton */}
              <div className="space-y-3">
                <Skeleton className="w-32 h-6" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-20 h-6 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex justify-center lg:justify-end">
              <Skeleton className="w-80 h-80 rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Skeleton className="w-48 h-4" />
            <div className="flex space-x-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-4" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
