import React from 'react';
// import { Metadata } from 'next';
import { ErrorBoundary } from '@/components/error-boundary';
import { CourseErrorFallback } from './_/components/skeletons/course-error-fallback';
import { fetchServerCourseBySlug } from '@/lib/server-apis';
import { Metadata } from 'next';

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

async function getCourse(slug: string) {
  const courseRes = await fetchServerCourseBySlug(slug, {
    next: { revalidate: 120 }, // refresh every 2 min
  });
  return courseRes;
}

export async function generateMetadata({ params }: CourseLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getCourse(slug);
    if (!course.success) {
      return {
        title: 'course not found',
      };
    }

    // For now, return generic metadata
    const title = course.course?.title;
    const description =
      course.course?.description.slice(0, 100) ||
      `Learn new skills with our comprehensive online course. Join thousands of students worldwide.`;

    return {
      title,
      description,
      keywords: ['online course', 'learning', 'education', 'skill development', 'byway'],
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/courses/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `/courses/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);

    return {
      title: 'Course',
      description: 'Online learning platform',
    };
  }
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const { slug } = await params;
  return (
    <ErrorBoundary fallback={<CourseErrorFallback slug={slug} />}>
      <div className="course-layout">{children}</div>
    </ErrorBoundary>
  );
}
