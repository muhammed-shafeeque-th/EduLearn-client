'use client';

import React from 'react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'lg',
  text = 'Loading...',
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      {/* Animated Logo */}
      <div className="relative">
        <Logo size={size} animated />

        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute inset-y-0 w-1 bg-white/30 animate-scan" />
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground animate-pulse">{text}</span>
          <div className="flex space-x-1">
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
