'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { adminService } from '@/services/admin';
import { courseService, PaginationParams } from '@/services/course';

/**
 * Hook to fetch and mutate a single course by ID, including publish, unpublish, and delete actions.
 *
 * @param courseId - The ID of the course to fetch and mutate
 * @param enabled - Whether the course query should be enabled
 */
export function useAdminCourse(courseId?: string, enabled: boolean = false) {
  const queryClient = useQueryClient();

  const isEnabled = !!courseId && (enabled ?? true);

  // Fetch course details
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey:
      typeof courseId === 'string'
        ? QUERY_KEYS.courses.detail(courseId)
        : ['course', 'detail', 'undefined'],
    queryFn: ({ signal }) => {
      if (!courseId) throw new Error('courseId is required');
      return courseService.getCourseById(courseId, { signal });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isEnabled,
    meta: {
      errorMessage: 'Failed to load course details',
    },
    select: (response) => (response.success ? response.data : null),
  });

  // Helper to safely retrieve instructorId from course object
  const instructorId =
    typeof data === 'object' && data && typeof data.instructorId === 'string'
      ? data.instructorId
      : undefined;

  // Publish course mutation
  const {
    mutateAsync: publishCourse,
    isPending: isPublishing,
    error: publishError,
  } = useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      const response = await adminService.publishCourse(courseId);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Prefer using the courseId argument directly for cache keys
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(variables.courseId) });
      if (instructorId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(instructorId),
        });
      }
    },
    meta: {
      successMessage: 'Course published successfully!',
      errorMessage: 'Failed to publish course',
    },
  });

  // Unpublish course mutation
  const {
    mutateAsync: unPublishCourse,
    isPending: isUnpublishing,
    error: unpublishError,
  } = useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      const response = await adminService.unPublishCourse(courseId);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(variables.courseId) });
      if (instructorId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(instructorId),
        });
      }
    },
    meta: {
      successMessage: 'Course unpublished successfully!',
      errorMessage: 'Failed to unpublish course',
    },
  });

  // Delete course mutation
  const {
    mutateAsync: deleteCourse,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async ({ courseId }: { courseId: string }) => {
      await adminService.deleteCourse(courseId);

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.courses.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.list({}) });
      if (instructorId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(instructorId),
        });
      }
    },
    meta: {
      successMessage: 'Course deleted successfully!',
      errorMessage: 'Failed to delete course',
    },
  });

  return {
    course: data ?? null,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    publishCourse,
    isPublishing,
    publishError,
    unPublishCourse,
    isUnpublishing,
    unpublishError,
    deleteCourse,
    isDeleting,
    deleteError,
  };
}

export function useAdminInstructorCourses(
  instructorId: string,
  params: Partial<PaginationParams> = {}
) {
  const query = useQuery({
    queryKey: QUERY_KEYS.courses.byInstructor(instructorId),
    queryFn: async ({ signal }) =>
      adminService.getCoursesByInstructor(instructorId, { ...params }, { signal }),
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
