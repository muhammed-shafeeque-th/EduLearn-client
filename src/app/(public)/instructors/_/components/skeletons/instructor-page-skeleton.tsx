import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { InstructorCoursesSkeleton } from './instructor-courses-skeleton';
import { InstructorReviewsSkeleton } from './instructor-reviews-skeleton';

export function InstructorPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Basic Info */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-80 mb-4" />
                <Skeleton className="h-6 w-96 mb-6" />

                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* About Section */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-4 ${
                        i === 0
                          ? 'w-full'
                          : i === 1
                            ? 'w-5/6'
                            : i === 2
                              ? 'w-4/5'
                              : i === 3
                                ? 'w-full'
                                : i === 4
                                  ? 'w-3/4'
                                  : 'w-2/3'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Expertise Section */}
              <div>
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-6 rounded-full ${
                        i % 3 === 0 ? 'w-32' : i % 3 === 1 ? 'w-24' : 'w-28'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div>
                <Skeleton className="h-5 w-48 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-4 ${
                        i === 0 ? 'w-full' : i === 1 ? 'w-4/5' : i === 2 ? 'w-5/6' : 'w-3/4'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Profile Image */}
                  <Skeleton className="w-48 h-48 rounded-full mx-auto mb-6" />

                  {/* Contact Button */}
                  <Skeleton className="h-12 w-full mb-4" />

                  {/* Social Links */}
                  <div className="space-y-3 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="pt-6 border-t space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section Skeleton */}
      <InstructorCoursesSkeleton />

      {/* Reviews Section Skeleton */}
      <InstructorReviewsSkeleton />
    </div>
  );
}
