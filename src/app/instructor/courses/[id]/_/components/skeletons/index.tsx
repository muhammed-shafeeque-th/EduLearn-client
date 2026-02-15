function CourseDetailHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="aspect-video bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function CourseStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
      <div className="h-64 w-full bg-muted rounded animate-pulse" />
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
