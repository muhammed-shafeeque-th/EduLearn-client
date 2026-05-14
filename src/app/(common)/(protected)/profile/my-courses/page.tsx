import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { MyCoursesContent } from './_/components/my-courses-content';
import { MyCoursesContentSkeleton } from './_/components/skeletons/my-course-page-skeletons';
import type { Metadata } from 'next';
import { getServerQueryClient } from '@/lib/react-query/server';
import { authGuard } from '@/lib/auth';
import { serverEnrollmentService } from '@/services/server-service-clients';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Courses - EduLearn',
  description: 'Manage and view your enrolled courses',
  keywords: ['courses', 'learning', 'education', 'online courses'],
};

export default async function MyCoursesPage() {
  const queryClient = getServerQueryClient();
  const user = await authGuard();

  if (!user) return redirect('/auth/login');

  await queryClient.prefetchInfiniteQuery({
    queryKey: QUERY_KEYS.enrollment.list(user!.id, {}),
    queryFn: ({ pageParam = 1 }) =>
      serverEnrollmentService.getEnrollments({ page: pageParam, pageSize: 12 }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
                <p className="text-muted-foreground">Continue your learning journey</p>
              </div>
            </div>
          </div>

          {/* Courses Content */}
          <Suspense fallback={<MyCoursesContentSkeleton />}>
            <MyCoursesContent />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}
