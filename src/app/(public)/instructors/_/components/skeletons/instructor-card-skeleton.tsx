import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InstructorCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* Header */}
      <Skeleton className="h-24 w-full" />

      <CardContent className="p-4 -mt-8 relative">
        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <Skeleton className="w-16 h-16 rounded-full border-4 border-background" />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <Skeleton className="h-5 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 py-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Button */}
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
