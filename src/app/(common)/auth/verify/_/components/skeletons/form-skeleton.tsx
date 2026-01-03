import { Skeleton } from '@/components/ui/skeleton';

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Email info */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* OTP inputs */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48 mx-auto" />
        <div className="flex justify-center space-x-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded" />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-2 h-2 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <Skeleton className="h-12 w-full" />

      {/* Resend section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Help text */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-56 mx-auto" />
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>
    </div>
  );
}
