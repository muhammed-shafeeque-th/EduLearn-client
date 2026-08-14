import { Suspense } from 'react';
import { CoursesPageContainer } from './_/components/course-page-container';
import { CoursesPageSkeleton } from './_/components/skeletons';
import { Metadata } from 'next';
import { fetchServerCourses } from '@/lib/server-apis';
import type { CourseMeta } from '@/types/course';
import { buildListingMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/lib/constants/routes';
import { itemListJsonLd } from '@/lib/seo/json-ld';
import { JsonLd } from '@/components/seo/json-ld';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { search, page } = await searchParams;
  const hasActiveFilters = Boolean(search || (page && page !== '1'));

  return buildListingMetadata({
    title: 'Browse Courses',
    description: 'Browse expert-led online courses across design, tech, business, and more.',
    path: ROUTES.public.courses.root,
    hasActiveFilters,
  });
}

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

  const {
    courses,
    page,
    total,
    totalPages,
    pageSize: resolvedPageSize,
  } = await fetchServerCourses(
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
      <JsonLd
        data={itemListJsonLd(
          courses.map((c) => ({ name: c.title, path: ROUTES.public.courses.course(c.slug) }))
        )}
      />
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesPageContainer initialPage={initialPage} />
      </Suspense>
    </div>
  );
}
