import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { CourseDetailSkeleton } from './_/components/skeletons';
import { fetchServerCourseById } from '@/lib/server-apis';
import { CourseDetailClient } from './_/components/course-detail-client';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { course } = await fetchServerCourseById(id);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | Course Details `,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { course } = await fetchServerCourseById(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Suspense fallback={<CourseDetailSkeleton />}>
          <CourseDetailClient courseId={id} />
        </Suspense>
      </div>
    </div>
  );
}
