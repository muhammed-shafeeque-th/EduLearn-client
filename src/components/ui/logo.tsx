'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function Logo({ className, animated = true, size = 'xl' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], animated && 'animate-pulse', className)}
    >
      {/* Outer Circle */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="url(#gradient1)"
        className={animated ? 'animate-spin-slow' : ''}
      />

      {/* Inner Shape - Book/Learning Symbol */}
      <path
        d="M12 10h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Book Lines */}
      <line
        x1="15"
        y1="16"
        x2="25"
        y2="16"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="20"
        x2="25"
        y2="20"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="24"
        x2="22"
        y2="24"
        stroke="url(#gradient2)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Animated Gradient for Loading */}
        {animated && (
          <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6">
              <animate
                attributeName="stop-color"
                values="#3B82F6;#60A5FA;#3B82F6"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#1D4ED8">
              <animate
                attributeName="stop-color"
                values="#1D4ED8;#2563EB;#1D4ED8"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        )}
      </defs>
    </svg>
  );
}
