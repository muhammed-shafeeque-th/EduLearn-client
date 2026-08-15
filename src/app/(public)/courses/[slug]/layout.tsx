import React from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { CourseErrorFallback } from './_/components/skeletons/course-error-fallback';

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const { slug } = await params;
  return (
    <ErrorBoundary fallback={<CourseErrorFallback slug={slug} />}>
      <div className="course-layout">{children}</div>
    </ErrorBoundary>
  );
}
