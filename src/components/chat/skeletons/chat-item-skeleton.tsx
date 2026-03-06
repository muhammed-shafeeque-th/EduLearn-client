'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatItemSkeleton() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <Skeleton className="w-10 h-10 rounded-full" />
          {/* Online indicator */}
          <Skeleton className="absolute bottom-0 right-0 w-3 h-3 rounded-full" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-3 h-3" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-32 flex-1" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
