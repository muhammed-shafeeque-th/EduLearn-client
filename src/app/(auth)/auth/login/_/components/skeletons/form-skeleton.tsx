import { Skeleton } from '@/components/ui/skeleton';

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Social buttons */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-px flex-1" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Signup link */}
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
