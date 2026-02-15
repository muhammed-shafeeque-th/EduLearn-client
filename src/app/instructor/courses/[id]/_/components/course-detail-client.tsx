'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useCourse } from '@/states/server/course/use-course';
import { CourseDetailHeaderSkeleton, CourseDetailSkeleton } from './skeletons';

type CourseDetailClientProps = {
  courseId: string;
};

const CourseDetailHeader = dynamic(
  () => import('./course-detail-header').then((mod) => mod.CourseDetailHeader),
  {
    ssr: false,
    loading: () => <CourseDetailHeaderSkeleton />,
  }
);

const CourseDetail = dynamic(() => import('./course-detail').then((mod) => mod.CourseDetail), {
  ssr: false,
  loading: () => <CourseDetailSkeleton />,
});

export function CourseDetailClient({ courseId }: CourseDetailClientProps) {
  const { course, isFetching, error } = useCourse(courseId, true);

  if (isFetching) {
    return (
      <div className="space-y-8">
        <CourseDetailHeaderSkeleton />
        <CourseDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        <p>Failed to load the course details. Please try again later.</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Course not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Suspense fallback={<CourseDetailHeaderSkeleton />}>
        <CourseDetailHeader course={course} />
      </Suspense>
      <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetail course={course} />
      </Suspense>
    </div>
  );
}
