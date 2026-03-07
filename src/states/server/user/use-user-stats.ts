'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { ApiResponse } from '@/types/api-response';
import {
  InstructorCoursesStats,
  InstructorsStats,
  InstructorStats,
  userService,
} from '@/services/user.service';
import { CourseAnalytics } from '@/services/course.service';

function getApiDataOrNull<T>(data: ApiResponse<T> | undefined | null): T | null {
  return !!data && data.success ? data.data : null;
}

/**
 * Hook to fetch analytics for a specific instructor.
 *
 * @param instructorId - The ID of the instructor.
 * @param options - Optional react-query options.
 */
export function useInstructorStats(
  instructorId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<InstructorStats>,
      Error,
      InstructorStats | null,
      ReturnType<typeof QUERY_KEYS.users.instructorStats>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  > & {
    enabled: boolean;
  }
) {
  const enabled = (options?.enabled ?? true) && Boolean(instructorId);

  return useQuery<
    ApiResponse<InstructorStats>,
    Error,
    InstructorStats | null,
    ReturnType<typeof QUERY_KEYS.users.instructorStats>
  >({
    queryKey: QUERY_KEYS.users.instructorStats(instructorId ?? ''),
    queryFn: async ({ signal }) => {
      if (!instructorId) {
        throw new Error('Instructor ID is required');
      }
      return userService.getInstructorStats(instructorId, { signal });
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled,
    meta: {
      errorMessage: 'Failed to load instructor analytics',
    },
    ...options,
    select: options?.select ?? getApiDataOrNull,
  });
}

export function useInstructorsStats(
  options?: Omit<
    UseQueryOptions<
      ApiResponse<InstructorsStats>,
      Error,
      InstructorsStats | null,
      ReturnType<typeof QUERY_KEYS.users.instructorsStats>
    >,
    'queryKey' | 'queryFn'
  > & {
    enabled: boolean;
  }
) {
  const query = useQuery<
    ApiResponse<InstructorsStats>,
    Error,
    InstructorsStats | null,
    ReturnType<typeof QUERY_KEYS.users.instructorsStats>
  >({
    queryKey: QUERY_KEYS.users.instructorsStats(),
    queryFn: ({ signal }) => userService.getInstructorsStats({ signal }),
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load instructors stats',
    },
    ...options,
    select: options?.select ?? getApiDataOrNull,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}

/**
 * Hook to fetch statistics about all courses of a specific instructor.
 *
 * @param instructorId - The ID of the instructor.
 * @param options - Optional react-query options.
 */
export function useInstructorCoursesStats(
  instructorId: string | null | undefined,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<InstructorCoursesStats>,
      Error,
      InstructorCoursesStats | null,
      ReturnType<typeof QUERY_KEYS.users.instructorCoursesStats>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  > & {
    enabled: boolean;
  }
) {
  const enabled = (options?.enabled ?? true) && Boolean(instructorId);

  const query = useQuery<
    ApiResponse<InstructorCoursesStats>,
    Error,
    InstructorCoursesStats | null,
    ReturnType<typeof QUERY_KEYS.users.instructorCoursesStats>
  >({
    queryKey: QUERY_KEYS.users.instructorCoursesStats(instructorId ?? ''),
    queryFn: async ({ signal }) => {
      if (!instructorId) {
        throw new Error('Instructor ID is required');
      }
      return userService.getInstructorCoursesStats(instructorId, { signal });
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled,
    meta: {
      errorMessage: 'Failed to load instructor courses stats',
    },
    ...options,
    select: options?.select ?? getApiDataOrNull,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
export function useInstructorCourseStats(
  instructorId: string,
  courseId: string,
  options?: Omit<
    UseQueryOptions<
      ApiResponse<CourseAnalytics>,
      Error,
      CourseAnalytics | null,
      ReturnType<typeof QUERY_KEYS.users.instructorCourseStats>
    >,
    'queryKey' | 'queryFn' | 'enabled'
  > & {
    enabled: boolean;
  }
) {
  const enabled = (options?.enabled ?? true) && Boolean(instructorId) && Boolean(courseId);

  const query = useQuery<
    ApiResponse<CourseAnalytics>,
    Error,
    CourseAnalytics | null,
    ReturnType<typeof QUERY_KEYS.users.instructorCourseStats>
  >({
    queryKey: QUERY_KEYS.users.instructorCourseStats(instructorId!, courseId!),
    queryFn: async ({ signal }) => {
      if (!instructorId) {
        throw new Error('Instructor ID is required');
      }
      return userService.getInstructorCourseStats(instructorId, courseId, { signal });
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled,
    meta: {
      errorMessage: 'Failed to load instructor courses stats',
    },
    ...options,
    select: options?.select ?? getApiDataOrNull,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    query,
  };
}
