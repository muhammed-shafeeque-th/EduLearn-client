import { Suspense } from 'react';
import { CoursesPageContainer } from './_/components/course-page-container';
import { CoursesPageSkeleton } from './_/components/skeletons';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchServerCourses } from '@/lib/server-apis';

export const metadata: Metadata = {
  title: 'Browse Courses | Your Platform',
  description: 'Explore a wide range of online courses across various categories.',
};

interface SearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  categories?: string;
  rating?: string;
  level?: string;
  priceMin?: string;
  priceMax?: string;
  free?: string;
  paid?: string;
  sortBy?: string;
}

async function getInitialCourses(searchParams: SearchParams) {
  const coursesResult = await fetchServerCourses(searchParams, {
    next: { revalidate: 60 }, // Revalidate every minute
  });

  return {
    ...coursesResult,
  };
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getInitialCourses(params);

  if (!data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesPageContainer initialCourses={data.courses} initialPagination={data!} />
      </Suspense>
    </div>
  );
}

// export const dynamic = 'force-dynamic';
// export const revalidate = 60;
