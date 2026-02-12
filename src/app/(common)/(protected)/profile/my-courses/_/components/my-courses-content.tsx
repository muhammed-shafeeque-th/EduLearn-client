'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoursesList } from './courses-list';
import { CoursesStats } from './courses-stats';
import { MyCoursesContentSkeleton } from './skeletons/my-course-page-skeletons';
import { Enrollment } from '@/types/enrollment';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnrollmentInfinite } from '@/states/server/enrollment/use-enrollment';

export function MyCoursesContent() {
  const router = useRouter();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useEnrollmentInfinite({ pageSize: 12 });

  const enrollments = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => (page.success ? page.data : []));
  }, [data]);

  const coursesStats = useMemo(() => {
    if (!enrollments.length) {
      return {
        total: 0,
        inProgress: 0,
        completed: 0,
        averageProgress: 0,
      };
    }

    const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
    const inProgress = enrollments.filter((e) => e.status === 'ACTIVE').length;
    const averageProgress =
      enrollments.reduce((acc, e) => acc + (e.progress ?? 0), 0) / enrollments.length;

    return {
      total: enrollments.length,
      inProgress,
      completed,
      averageProgress: Math.round(averageProgress),
    };
  }, [enrollments]);

  const handleCourseClick = (enrollment: Enrollment) => {
    router.push(`/learn/${enrollment.id}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <MyCoursesContentSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load courses. Please try again.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!enrollments.length) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            Start your learning journey by enrolling in your first course.
          </p>
          <Button onClick={() => router.push('/courses')} size="lg">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CoursesStats stats={coursesStats} />
      <CoursesList
        enrollments={enrollments}
        onCourseClick={handleCourseClick}
        onLoadMore={handleLoadMore}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
      />
    </div>
  );
}
