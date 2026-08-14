import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                {/* Course Image */}
                <Skeleton className="h-48 w-full" />

                <CardContent className="p-6 space-y-4">
                  {/* Badges */}
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>

                  {/* Title */}
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />

                  {/* Instructor */}
                  <Skeleton className="h-4 w-32" />

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-12" />
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>

                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-2 h-2 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
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
    </div>
  );
}
