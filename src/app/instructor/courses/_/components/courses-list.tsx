'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CourseCard } from './course-card';
import Pagination from '@/components/ui/pagination';
import { EmptyState } from './empty-state';
import { useAuthUserSelector } from '@/states/client';
import { useInstructorCourses } from '@/states/server/course/use-courses';
import { CoursesListSkeleton } from './courses-skeleton';

interface CoursesListProps {
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    rating?: string;
    page?: string;
  };
}

const PAGE_SIZE = 10;

export function CoursesList({ searchParams }: CoursesListProps) {
  const user = useAuthUserSelector();
  const instructorId = user?.userId ?? '';

  // Parse page number from query params; default to 1 if invalid
  const currentPage = useMemo(() => {
    const pageStr = searchParams.page;
    const parsed = pageStr && !isNaN(Number(pageStr)) ? parseInt(pageStr, 10) : 1;
    return parsed > 0 ? parsed : 1;
  }, [searchParams.page]);

  // Fetch instructor courses
  const { isLoading, courses, pagination, isError } = useInstructorCourses(instructorId, {
    page: currentPage,
    pageSize: PAGE_SIZE,
    // Add additional filters as needed (search, category, sort, rating)
    sortOrder: searchParams.sort as 'desc' | undefined,
  });

  // Memoize course and pagination data
  // const courses = useMemo(() => coursesResponse?.data ?? [], [coursesResponse]);
  // const pagination = useMemo(() => coursesResponse?.pagination, [coursesResponse]);
  const totalPages =
    typeof pagination?.totalPages === 'number' && pagination.totalPages > 0
      ? pagination.totalPages
      : 1;
  const totalCourses = pagination?.total ?? 0;

  // Routing for pagination (recommended: useRouter from next/navigation)
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(urlSearchParams.toString());
      params.set('page', String(page));

      // Maintain smooth scrolling UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Navigate while updating the query string (so browser history works)
      router.replace(`?${params.toString()}`);
    },
    [router, urlSearchParams]
  );

  // Handle loading state
  if (isLoading) {
    return <CoursesListSkeleton />;
  }

  // Handle error state
  if (isError) {
    return <EmptyState message="Failed to load courses, please try again." />;
  }

  // Handle empty state (no courses)
  if (!Array.isArray(courses) || courses.length === 0 || !totalCourses) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {totalCourses} course{totalCourses === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
