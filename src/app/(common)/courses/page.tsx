import { Suspense } from 'react';
import { CoursesPageContainer } from './_/components/course-page-container';
import { CoursesPageSkeleton } from './_/components/skeletons';
import { Metadata } from 'next';
import { fetchServerCourses } from '@/lib/server-apis';
import type { CourseMeta } from '@/types/course';

export const metadata: Metadata = {
  title: 'Browse Courses | Your Platform',
  description: 'Explore a wide range of online courses across various categories.',
};

export const revalidate = 60;

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
  sort?: string;
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageSize = parseInt(params.pageSize ?? '12', 10);

  const { courses, page, total, totalPages, pageSize: resolvedPageSize } = await fetchServerCourses(
    {
      page: '1',
      pageSize: String(pageSize),
      sortBy: params.sort ?? params.sortBy ?? 'trending',
    },
    { next: { revalidate: 60 } }
  );

  const initialPage =
    courses.length > 0
      ? {
          courses: courses as unknown as CourseMeta[],
          page: page ?? 1,
          pageSize: resolvedPageSize ?? pageSize,
          total: total ?? courses.length,
          totalPages: totalPages ?? 1,
        }
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesPageContainer initialPage={initialPage} />
      </Suspense>
    </div>
  );
}
