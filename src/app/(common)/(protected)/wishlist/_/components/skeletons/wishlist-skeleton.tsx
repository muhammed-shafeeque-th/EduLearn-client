import { Heart } from 'lucide-react';
import { CourseCardSkeleton } from './course-card-skeleton';

export function WishlistSkeleton() {
  const skeletonCount = 4; 

  return (
    <section
      className="min-h-screen bg-background flex flex-col"
      aria-label="Loading wishlist skeleton"
    >
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart
              className="w-7 h-7 text-muted-foreground animate-pulse"
              aria-hidden="true"
              focusable="false"
            />
            <div className="h-7 w-36 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
          </div>
          <div className="hidden md:block">
            <div className="h-5 w-28 bg-muted rounded-lg animate-pulse" aria-hidden="true" />
          </div>
        </header>

        {/* Course Cards Skeleton */}
        <div className="grid grid-cols-1 gap-6" aria-label="Loading skeleton course list">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
