'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatItemSkeleton } from './chat-item-skeleton';
import { MessageBubbleSkeleton } from './message-bubble-skeleton';

export function MyChatsPageSkeleton() {
  return (
    <div className="flex">
      {/* Chats List */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="w-4 h-4" />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <ChatItemSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />

            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8" />
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date Separator */}
          <div className="flex items-center justify-center">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Messages */}
          <div className="space-y-4">
            <MessageBubbleSkeleton isOwn={false} />
            <MessageBubbleSkeleton isOwn={true} showAvatar={false} />
            <MessageBubbleSkeleton isOwn={false} showAvatar={false} />
            <MessageBubbleSkeleton isOwn={true} showAvatar={false} />
            <MessageBubbleSkeleton isOwn={false} />
          </div>

          {/* Typing Indicator */}
          <div className="ml-11">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex space-x-1">
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="w-2 h-2 rounded-full" />
                <Skeleton className="w-2 h-2 rounded-full" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex items-end gap-2">
            <Skeleton className="w-8 h-8" />
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
