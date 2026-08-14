import { Skeleton } from '@/components/ui/skeleton';

export function FAQsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-24 h-6" />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-4" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-primary/50 to-blue-500 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Skeleton className="w-48 h-6 mx-auto mb-6 bg-primary/40" />
            <Skeleton className="w-96 h-12 mx-auto mb-4 bg-primary/40" />
            <Skeleton className="w-80 h-6 mx-auto mb-8 bg-primary/30" />
            <Skeleton className="w-96 h-12 mx-auto bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded p-6 border border-gray-200 dark:border-gray-700">
                <Skeleton className="w-24 h-6 mb-4" />
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-10" />
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ List Skeleton */}
            <div className="lg:col-span-3">
              <Skeleton className="w-64 h-4 mb-6" />
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xs p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Skeleton className="w-20 h-5 mb-2" />
                        <Skeleton className="w-full h-6 mb-2" />
                        <Skeleton className="w-3/4 h-4" />
                      </div>
                      <Skeleton className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Skeleton className="w-64 h-8 mx-auto mb-4" />
            <Skeleton className="w-96 h-4 mx-auto mb-8" />
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-6">
              <div className="space-y-4">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
