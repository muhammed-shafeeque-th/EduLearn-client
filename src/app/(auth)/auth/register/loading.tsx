'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton } from './_/components/skeletons/form-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Header Skeleton */}
      <div className="hidden lg:flex lg:w-1/2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Card Skeleton */}
      <Card className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <FormSkeleton />
      </Card>
    </div>
  );
}
