'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChartSkeleton() {
  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="h-[300px] flex items-end gap-2 pb-6">
        {[...Array(12)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
