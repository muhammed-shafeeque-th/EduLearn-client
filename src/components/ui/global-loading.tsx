'use client';

import React from 'react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface GlobalLoadingProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function GlobalLoading({
  isLoading,
  message = 'Loading...',
  className,
}: GlobalLoadingProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <Logo />

          {/* Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-primary/40 animate-pulse" />
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-slide-in-left" />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground animate-pulse">{message}</p>
          <div className="flex items-center justify-center space-x-1">
            <div
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
