import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { HydrationBoundary } from '@tanstack/react-query';

import { CourseEditor } from './_';
import { prefetchCourse } from '@/lib/react-query/server';
import { CourseEditorSkeleton } from './_/components/skeletons/course-editor-skeleton';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;

  const { course, dehydratedState } = await prefetchCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <Suspense fallback={<CourseEditorSkeleton />}>
            <CourseEditor course={course} />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}
