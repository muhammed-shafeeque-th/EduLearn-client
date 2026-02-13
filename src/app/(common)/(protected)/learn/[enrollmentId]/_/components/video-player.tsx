'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LessonWithProgress } from '@/types/enrollment/enrollment.type';

const PlyrComponent = dynamic(() => import('./plyr-wrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  ),
});

interface Props {
  enrollmentId: string;
  lesson: LessonWithProgress;
  onVideoEnd?: () => void;
}

export function SecureVideoPlayer(props: Props) {
  return (
    <Card className="overflow-hidden bg-black border-none shadow-none">
      <CardContent className="p-0">
        <div className="aspect-video w-full relative">
          {/* Key forces a complete remount when lesson changes, 
              clearing old state instantly */}
          <PlyrComponent key={props.lesson.id} {...props} />
        </div>
      </CardContent>
    </Card>
  );
}
