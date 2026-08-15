export function CoursesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-5 bg-muted rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-muted rounded animate-pulse w-20" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
                <div className="h-3 bg-muted rounded animate-pulse w-20" />
              </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
              <div className="h-8 bg-muted rounded animate-pulse flex-1" />
              <div className="h-8 bg-muted rounded animate-pulse flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
