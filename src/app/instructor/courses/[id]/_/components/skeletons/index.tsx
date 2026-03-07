function CourseDetailHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-9 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="aspect-video bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function CourseStatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="h-3 w-16 bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6">
        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted rounded-lg animate-pulse mb-3" />
        ))}
      </div>
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-8">
      <CourseDetailHeaderSkeleton />
      <CourseStatsSkeleton />
      <CourseContentSkeleton />
    </div>
  );
}

export { CourseDetailHeaderSkeleton, CourseStatsSkeleton, CourseContentSkeleton };
