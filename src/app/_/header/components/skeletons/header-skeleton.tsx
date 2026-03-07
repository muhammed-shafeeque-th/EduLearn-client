'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Skeleton className="h-8 w-32" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-20" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </header>
  );
}
