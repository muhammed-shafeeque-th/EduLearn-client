import { Suspense } from 'react';
import { CoursesPageContainer } from './_/components/course-page-container';
import { CoursesPageSkeleton } from './_/components/skeletons';
import { Metadata } from 'next';
import { fetchServerCourses } from '@/lib/server-apis/courses-api';
import type { CourseMeta } from '@/types/course';
import { buildListingMetadata } from '@/lib/seo/metadata';
import { absoluteUrl, ROUTES } from '@/lib/constants/routes';
import { itemListJsonLd } from '@/lib/seo/json-ld';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_NAME } from '@/lib/constants';

export async function generateMetadata({}: PageProps): Promise<Metadata> {
  const title = 'Browse Courses | Online Learning Platform';
  const description =
    'Discover expert-led online courses across design, tech, business, and more. Learn from industry practitioners with structured, practical courses.';
  const courseUrl = absoluteUrl(ROUTES.public.courses.root);

  return {
    ...buildListingMetadata({
      title,
      description,
      path: ROUTES.public.courses.root,
    }),

    description,
    keywords: [
      'online courses',
      'learn design',
      'tech courses',
      'business courses',
      'skill development',
      'expert-led courses',
      'online learning',
    ],

    openGraph: {
      title,
      description,
      url: courseUrl,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: absoluteUrl('/og/og-explore-courses.png'),
          width: 1200,
          height: 630,
          alt: 'Structured courses, taught by practitioners',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/og/og-explore-courses.png')],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
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
