import { Suspense } from 'react';
import { CourseHeader } from './_/components/course-header';
import { CourseContent } from './_/components/course-content';
import { CourseSidebar } from './_/components/course-sidebar';
import { CourseHeaderSkeleton } from './_/components/skeletons/course-header-skeleton';
import { CourseContentSkeleton } from './_/components/skeletons/course-content-skeleton';
import { CourseSidebarSkeleton } from './_/components/skeletons/course-sidebar-skeleton';
import { Course } from '@/types/course';
import { Metadata } from 'next';
// import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
// import { ApiResponse } from '@/types/api-response';
// import { reviveDates } from '@/lib/utils';
import { fetchServerCourseBySlug, fetchServerCourses } from '@/lib/server-apis/courses-api';
import { config } from '@/lib/config';
import CourseJsonLd from './_/utils/CourseJsonLd';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ROUTES } from '@/lib/constants/routes';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

// const CourseSidebar = dynamic(
//   () => import('./_/components/course-sidebar').then((mod) => mod.CourseSidebar),
//   { ssr: true } // disable server-side rendering for this component
// );

// async function getCourse(slug: string) {
//   try {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const courseResponse: any = await fetchApi(`${ROUTES.public.courses.root}/slug/${slug}`, {
//       skipAll: true,
//       next: { revalidate: 120 }, // refresh every 2 min
//     });

//     if (!courseResponse.ok) throw new Error('Failed to fetch course');
//     const responseText = await courseResponse.text();

//     const course = JSON.parse(responseText, reviveDates) as ApiResponse<Course>;
//     if (!course.success) {
//       throw new Error(course.message);
//     }
//     return course;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

async function getCourse(slug: string) {
  const courseRes = await fetchServerCourseBySlug(slug, {
    next: { revalidate: 120 }, // refresh every 2 min
  });
  return courseRes;
}

// Pre-render popular/static course pages
export async function generateStaticParams() {
  const { courses } = await fetchServerCourses(
    {},
    {
      next: { revalidate: 600 }, // fetch once every 10 min
    }
  );

  return courses?.slice(0, 50).map((course: Course) => ({
    slug: course.slug.toString(),
  }));
}

const DESCRIPTION_MAX_LEN = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { course, success } = await getCourse(slug)!;
  if (!success || !course) {
    return { title: 'Course Not Found ' };
  }

  const url = `${config.siteUrl}/courses/${course.slug}`;

  const trimStr = (str: string, maxLen: number) =>
    str.length > maxLen ? str.slice(0, maxLen) + '...' : str;

  return {
    title: course.title,
    description: trimStr(course.description, DESCRIPTION_MAX_LEN),
    keywords: [
      course.title,
      'online course',
      course.instructor?.name,
      course.level,
      'EduLearn',
    ].filter(Boolean) as string[],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: course.title,
      description: trimStr(course.description, DESCRIPTION_MAX_LEN),
      url,
      siteName: 'EduLearn',
      images: [
        {
          url: course.thumbnail,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: trimStr(course.description, DESCRIPTION_MAX_LEN),
      images: [course.thumbnail],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const { course, success } = await getCourse(slug);

  if (!success || !course) {
    return notFound();
  }

  return (
    <>
      <CourseJsonLd course={course} />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <Breadcrumbs
            items={[
              { label: 'Home', path: ROUTES.public.home },
              { label: 'Courses', path: ROUTES.public.courses.root },
              { label: course.title, path: ROUTES.public.courses.course(course.slug) },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Suspense fallback={<CourseHeaderSkeleton />}>
                <CourseHeader course={course} />
              </Suspense>

              <Suspense fallback={<CourseContentSkeleton />}>
                <CourseContent course={course} />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Suspense fallback={<CourseSidebarSkeleton />}>
                  <CourseSidebar course={course} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
