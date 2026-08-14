export default function EnrollmentPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Video Player Skeleton */}
            <div className="aspect-video bg-muted animate-pulse rounded-lg mb-6" />

            {/* Tabs Skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-4">
              <div className="h-24 bg-muted animate-pulse rounded-lg" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
