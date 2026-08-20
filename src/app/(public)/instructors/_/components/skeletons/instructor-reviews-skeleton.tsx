import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function InstructorReviewsSkeleton() {
  return (
    <div className="bg-card py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Rating Summary Skeleton */}
          <div className="lg:col-span-1">
            <Skeleton className="h-8 w-40 mb-6" />

            {/* Overall Rating */}
            <div className="flex items-center mb-6">
              <Skeleton className="h-8 w-8 mr-2" />
              <Skeleton className="h-8 w-12 mr-2" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Reviews List Skeleton */}
          <div className="lg:col-span-2">
            {/* Filter Info */}
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Review Cards */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Skeleton key={j} className="h-3 w-3" />
                              ))}
                            </div>
                            <Skeleton className="h-4 w-6" />
                          </div>
                        </div>

                        {/* Date */}
                        <Skeleton className="h-3 w-24" />

                        {/* Comment */}
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>

                        {/* Course Name Badge */}
                        <Skeleton className="h-5 w-24" />

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              <Skeleton className="h-10 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
