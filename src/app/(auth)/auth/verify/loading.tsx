import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-16 w-16 mx-auto rounded-full" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Card Skeleton */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader className="space-y-1 pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="flex justify-center space-x-2">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>

      {/* Footer Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  );
}
