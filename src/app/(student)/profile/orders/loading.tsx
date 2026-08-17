export default function OrdersSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-5 w-72 bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Orders Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-8 w-28 bg-muted rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-16 bg-muted/50 rounded-lg" />
        <div className="h-16 bg-muted/50 rounded-lg" />
      </div>
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-5 w-full bg-muted rounded" />
      </div>
    </div>
  );
}
