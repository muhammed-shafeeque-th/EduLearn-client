import { Skeleton } from '@/components/ui/skeleton';

export function ResetPasswordSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>

      {/* Alert */}
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Footer link */}
      <div className="text-center">
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );
}
