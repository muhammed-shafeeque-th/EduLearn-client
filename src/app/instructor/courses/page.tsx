import { Metadata } from 'next';
import { Suspense } from 'react';

import { CoursesFilters } from './_/components/courses-filters';
import { CoursesList } from './_/components/courses-list';
import { CoursesStats } from './_/components/courses-stats';
import { CoursesListSkeleton } from './_/components/courses-skeleton';
import { CoursesHeader } from './_/components/course-header';

export const metadata: Metadata = {
  title: 'My Courses | Instructor Dashboard ',
  description: 'Manage your courses, track performance, and engage with students.',
};

interface PageProps {
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    rating?: string;
    page?: string;
  };
}

export default async function InstructorCoursesPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8 space-y-6">
        <CoursesHeader />

        <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
          <CoursesStats />
        </Suspense>

        <CoursesFilters searchParams={searchParams} />

        <Suspense fallback={<CoursesListSkeleton />}>
          <CoursesList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
