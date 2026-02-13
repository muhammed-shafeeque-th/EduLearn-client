'use client';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { EnrollmentParams, enrollmentService } from '@/services/enrollment.service';
import { useAuthUserSelector } from '@/states/client';

export function useEnrollment(id: string, options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();

  return useQuery({
    queryKey: QUERY_KEYS.enrollment.detail(authUser?.userId || 'current', id),
    queryFn: ({ signal }) => enrollmentService.getEnrollment(id, { signal }),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes for individual courses
    meta: {
      errorMessage: 'Failed to load enrollment details',
    },
    select(data) {
      return data.success ? data.data : null;
    },
  });
}
export function useEnrollments(params: Partial<EnrollmentParams>, options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();
  return useQuery({
    queryKey: QUERY_KEYS.enrollment.list(authUser?.userId || 'current', params),
    queryFn: ({ signal }) => enrollmentService.getEnrollments(params, { signal }),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual courses
    meta: {
      errorMessage: 'Failed to load enrollment details',
    },
    select(data) {
      return data.success ? data.data : null;
    },
  });
}

export function useUserEnrollmentIds(options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();
  return useQuery({
    queryKey: QUERY_KEYS.enrollment.ids(authUser?.userId || 'current'),
    queryFn: async ({ signal }) => {
      const res = await enrollmentService.getEnrollments({ pageSize: 100 }, { signal });
      if (!res.success) throw new Error(res.message);
      return res.data.map((e) => e.courseId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useIsEnrolled(courseId: string) {
  const { data: enrolledCourseIds } = useUserEnrollmentIds();

  return {
    isEnrolled: enrolledCourseIds?.includes(courseId) ?? false,
  };
}

export function useEnrollmentInfinite(params: Partial<Omit<EnrollmentParams, 'page'>> = {}) {
  const authUser = useAuthUserSelector();
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.enrollment.list(authUser?.userId || 'current', {}),
    queryFn: ({ pageParam = 1, signal }) =>
      enrollmentService.getEnrollments({ ...params, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.success && firstPage.pagination?.hasPrev
        ? firstPage.pagination.page - 1
        : undefined,
    maxPages: 10,
    staleTime: 2 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load enrollments',
    },
  });
}
