'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MessageBubbleSkeletonProps {
  isOwn?: boolean;
  showAvatar?: boolean;
}

export function MessageBubbleSkeleton({
  isOwn = false,
  showAvatar = true,
}: MessageBubbleSkeletonProps) {
  return (
    <div
      className={cn(
        'flex gap-3 max-w-xs lg:max-w-md',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {/* Message Bubble */}
        <div
          className={cn(
            'px-4 py-2 rounded-lg',
            isOwn ? 'bg-primary/10 rounded-br-none' : 'bg-muted rounded-bl-none'
          )}
        >
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Message Info */}
        <div
          className={cn('flex items-center gap-2 mt-1', isOwn ? 'flex-row-reverse' : 'flex-row')}
        >
          <Skeleton className="h-3 w-12" />
          {isOwn && <Skeleton className="h-3 w-4" />}
        </div>
      </div>
    </div>
  );
}
