import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const HeroSkeleton = () => (
  <section className="min-h-screen flex items-center py-20 px-4">
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full max-w-lg" />
            <Skeleton className="h-6 w-full max-w-md" />
            <Skeleton className="h-6 w-full max-w-sm" />
          </div>
          <div className="space-y-4">
            <div className="flex space-x-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-48" />
            </div>
            <div className="flex space-x-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
        <div className="relative">
          <Skeleton className="w-80 h-80 md:w-96 md:h-96 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  </section>
);

export const StatsSkeleton = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="text-center space-y-2">
            <Skeleton className="h-10 w-20 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CategoriesSkeleton = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export const CoursesSkeleton = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-0 shadow-md">
            <Skeleton className="w-full h-48" />
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export const InstructorsSkeleton = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="text-center border-0 shadow-md">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="w-20 h-20 rounded-full mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
