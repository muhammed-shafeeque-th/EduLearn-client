'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { courseService } from '@/services/course';
import { CourseAnalytics, CoursesStats } from '@/services/course';

/**
 * Hook to fetch analytics for a specific course.
 * Exposes loading, error, and refetch states.
 *
 * @param courseId - The ID of the course.
 * @param options - Optional react-query options.
 */
export function useCourseAnalytics(
  courseId: string,
  options?: Partial<UseQueryOptions<CourseAnalytics, Error, CourseAnalytics>>
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    CourseAnalytics,
    Error,
    CourseAnalytics
  >({
    queryKey: QUERY_KEYS.courses.analytics(courseId),
    queryFn: async ({ signal }) => {
      const response = await courseService.getCourseAnalytics(courseId, { signal });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch course analytics');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: (options?.enabled ?? true) && !!courseId,
    meta: {
      errorMessage: 'Failed to load course analytics',
    },
    ...options,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}

/**
 * Hook to fetch overall statistics about all courses.
 * Suitable for dashboard system overview.
 * Exposes loading, error, and refetch states.
 *
 * @param options - Optional react-query options.
 */
export function useCoursesStats(
  options?: Partial<UseQueryOptions<CoursesStats, Error, CoursesStats>>
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    CoursesStats,
    Error,
    CoursesStats
  >({
    queryKey: QUERY_KEYS.courses.coursesStats(),
    queryFn: async () => {
      const response = await courseService.getCoursesStats();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch courses stats');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load courses stats',
    },
    ...options,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
