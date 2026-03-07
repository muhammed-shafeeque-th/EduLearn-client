'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { adminService } from '@/services/admin.service';
import { InstructorCoursesStats, InstructorsStats, UsersStats } from '@/services/user.service';
import { ApiResponse } from '@/types/api-response';
import { CourseAnalytics } from '@/services/course.service';

function getApiDataOrNull<T>(data: ApiResponse<T> | undefined | null): T | null {
  return !!data && data.success ? data.data : null;
}

export function useSystemOverview(options?: { enabled?: boolean; staleTime?: number }) {
  const query = useQuery({
    queryKey: QUERY_KEYS.admin.systemOverview(),
    queryFn: async ({ signal }) => {
      const response = await adminService.getSystemOverview({ signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load system overview',
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
    query,
  };
}
export function useRevenueStats(
  year?: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.revenueStats(year),
    queryFn: async ({ signal }) => {
      const response = await adminService.getRevenueStats(year, { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load system overview',
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
export function useEnrollmentTrend(
  year?: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.enrollmentTrend(year),
    queryFn: async ({ signal }) => {
      const response = await adminService.getEnrollmentTrend(year, { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load enrollment trend',
    },
  });

  return {
    trend: data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
export function useUsersGrowthTrend(
  year?: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.userGrowthTrend(year),
    queryFn: async ({ signal }) => {
      const response = await adminService.getUserGrowthTrend(year, { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load user growth trend',
    },
  });

  return {
    trend: data?.trend,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
export function useInstructorGrowthTrend(
  year?: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.instructorGrowthTrend(year),
    queryFn: async ({ signal }) => {
      const response = await adminService.getInstructorGrowthTrend(year, { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load instructor growth trend',
    },
  });

  return {
    trend: data?.trend,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
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
    queryFn: ({ signal }) => adminService.getInstructorsStats({ signal }),
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
export function useUsersStats(
  options?: Omit<
    UseQueryOptions<
      ApiResponse<UsersStats>,
      Error,
      UsersStats | null,
      ReturnType<typeof QUERY_KEYS.users.usersStats>
    >,
    'queryKey' | 'queryFn'
  > & {
    enabled: boolean;
  }
) {
  const query = useQuery<
    ApiResponse<UsersStats>,
    Error,
    UsersStats | null,
    ReturnType<typeof QUERY_KEYS.users.usersStats>
  >({
    queryKey: QUERY_KEYS.users.usersStats(),
    queryFn: ({ signal }) => adminService.getUsersStats({ signal }),
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load users stats',
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
      return adminService.getInstructorCoursesStats(instructorId, { signal });
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
      return adminService.getInstructorCourseStats(instructorId, courseId, { signal });
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
