'use client';

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { CourseParams, courseService, PaginationParams } from '@/services/course.service';
import { BasicInfoRequestPayload, Course, CoursePayload } from '@/types/course';
import { RequestOptions } from '@/services/base-service';

/**
 * Fetches courses with standard pagination; uses react-query best practice of keeping previous data for smooth transitions.
 */
export function useCourses(params: Partial<CourseParams> = {}) {
  const { data, isLoading, isError, error, isSuccess, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.courses.list(params),
    queryFn: ({ signal }) => courseService.getCourses(params, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load courses',
    },
    select: (data) => (data.success ? data : undefined),
  });

  return {
    courses: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    isError,
    isSuccess,
    error,
    isFetching,
    refetch,
    raw: data,
  };
}

/**
 * Fetch single course by ID.
 */
export function useCourseById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(id),
    queryFn: ({ signal }) => courseService.getCourseById(id, { signal }),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load course details',
    },
    select: (data) => (data.success ? data.data : null),
  });
}

/**
 * Fetch single course by slug.
 */
export function useCourseBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(slug),
    queryFn: ({ signal }) => courseService.getCourseBySlug(slug, { signal }),
    enabled: !!slug && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load course details',
    },
    select: (data) => (data.success ? data.data : null),
  });
}

/**
 * Infinite scrolling for courses.
 */
export function useCoursesInfinite(params: Partial<Omit<CourseParams, 'page'>> = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.courses.list(params),
    queryFn: ({ pageParam = 1, signal }) =>
      courseService.getCourses({ ...params, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.success && firstPage.pagination?.hasPrev
        ? firstPage.pagination.page - 1
        : undefined,
    maxPages: 20,
    staleTime: 2 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load courses',
    },
    select: (data) => data, // Keep flexible for transforms if needed
  });
}

export function useInstructorCoursesInfinite(
  instructorId: string,
  params: Partial<PaginationParams> = {}
) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.courses.byInstructor(instructorId, params),
    queryFn: async ({ pageParam = 1, signal }) =>
      courseService.getCoursesByInstructor(
        instructorId,
        { ...params, page: pageParam },
        { signal }
      ),
    initialPageParam: 1,
    enabled: !!instructorId,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.success && firstPage.pagination?.hasPrev
        ? firstPage.pagination.page - 1
        : undefined,
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load instructor courses',
    },
    select: (data) => data, // Keep flexible for transforms if needed
  });
}
export function useInstructorCourses(instructorId: string, params: Partial<PaginationParams> = {}) {
  const query = useQuery({
    queryKey: QUERY_KEYS.courses.byInstructor(instructorId),
    queryFn: async ({ signal }) =>
      courseService.getCoursesByInstructor(instructorId, { ...params }, { signal }),
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load instructor courses',
    },
  });

  const data = query.data;
  const courses = data?.success ? data.data : [];
  const pagination = data?.success ? data.pagination : undefined;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? 1;

  return {
    courses,
    pagination,
    totalPages,
    totalCount,
    currentPage,
    data,
    // Core query helpers and states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetched: query.isFetched,
    // For advanced needs
    query,
  };
}

/**
 * Fetches featured courses. Good for homepage, etc.
 */
export function useFeaturedCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.courses.featured(),
    queryFn: ({ signal }) => courseService.getFeaturedCourses({}, { signal }),
    staleTime: 15 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load featured courses',
    },
    select: (data) => (data.success ? data : undefined),
  });
}

// --- Mutations ---

/**
 * Create a new course.
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { data: Partial<BasicInfoRequestPayload>; options?: RequestOptions }) =>
      courseService.createCourse(request.data, request.options),
    onSuccess: (response) => {
      if (!response.success || !response.data) return;

      const newCourse = response.data;
      // Invalidate all course lists for freshness
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.lists() });

      // Add to instructor's infinite courses if present (not strictly required)
      if (newCourse.instructor?.id) {
        const instructorCoursesKey = QUERY_KEYS.courses.byInstructor(newCourse.instructor.id);
        queryClient.invalidateQueries({ queryKey: instructorCoursesKey });
      }

      // Set the new course in detail cache
      queryClient.setQueryData(QUERY_KEYS.courses.detail(newCourse.id), newCourse);
    },
    meta: {
      successMessage: 'Course created successfully!',
      errorMessage: 'Failed to create course',
    },
  });
}

/**
 * Update an existing course.
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      courseId: string;
      data: Partial<CoursePayload>;
      options?: RequestOptions;
    }) => courseService.updateCourse(request.courseId, request.data),
    onMutate: async ({ courseId, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });

      // Snapshot previous value
      const previousCourse = queryClient.getQueryData<Course>(QUERY_KEYS.courses.detail(courseId));

      // Optimistically update
      if (previousCourse) {
        queryClient.setQueryData(QUERY_KEYS.courses.detail(courseId), {
          ...previousCourse,
          ...data,
        });
      }

      return { previousCourse, courseId };
    },
    onError: (error, variables, context) => {
      if (context?.previousCourse && context?.courseId) {
        queryClient.setQueryData(
          QUERY_KEYS.courses.detail(context.courseId),
          context.previousCourse
        );
      }
    },
    onSuccess: (response, _variables) => {
      if (!response.success || !response.data) return;

      const updatedCourse = response.data;

      queryClient.setQueryData(QUERY_KEYS.courses.detail(updatedCourse.id), updatedCourse);

      // Invalidate all related course lists, but don't force refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courses.lists(),
        refetchType: 'none',
      });

      // Invalidate instructor's course pages if present
      if (updatedCourse.instructor?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(updatedCourse.instructor.id),
        });
      }
    },
    meta: {
      successMessage: 'Course updated successfully!',
      errorMessage: 'Failed to update course',
    },
  });
}

/**
 * Delete a course.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
    onSuccess: (response, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.courses.detail(deletedId) });

      // Invalidate all listings
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.lists() });
      // Invalidate all instructor course queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courses.all,
        predicate: (query) =>
          query.queryKey.some((key) => typeof key === 'string' && key.includes('instructor')),
      });
    },
    meta: {
      successMessage: 'Course deleted successfully!',
      errorMessage: 'Failed to delete course',
    },
  });
}
