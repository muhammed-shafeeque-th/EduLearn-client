'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SecureVideoPlayer = dynamic(
  () => import('./__/__video-player').then((m) => m.SecureVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <Card className="h-80 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </Card>
    ),
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SecureVideoPlayerLazy(props: any) {
  return (
    <Suspense fallback={<div />}>
      {/* dynamic component handles loading */}
      <SecureVideoPlayer {...props} />
    </Suspense>
  );
}
