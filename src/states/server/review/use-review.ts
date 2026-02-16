import { useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { courseService, PaginationParams } from '@/services/course.service';

/**
 * Hook to fetch paginated course reviews using React Query's useInfiniteQuery.
 * Returns: reviews array, pagination data, and API states for easy consumption in components.
 *
 * @param courseId - The course identifier to fetch reviews for.
 * @param params - Optional pagination and filter params, except 'page' which is managed by the hook.
 * @param options - Optional additional options for React Query.
 */
export function useCourseReviewInfinite(
  courseId: string,
  params: Partial<Omit<PaginationParams, 'page'>> = {},
  options?: Parameters<typeof useInfiniteQuery>[1]
) {
  const queryResult = useInfiniteQuery({
    queryKey: QUERY_KEYS.courses.reviews(courseId, params),
    queryFn: async ({ pageParam = 1, signal }) => {
      // Keep params spread multiline for readability and linting
      const response = await courseService.getCourseReviews(
        courseId,
        {
          ...params,
          page: pageParam,
        },
        { signal }
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch course reviews');
      }
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.success && lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage?.success && firstPage.pagination?.hasPrev
        ? firstPage.pagination.page - 1
        : undefined,
    maxPages: 10,
    staleTime: 2 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to load course reviews',
    },
    enabled: !!courseId,
    ...options,
  });

  // Aggregate reviews from all pages for easy usage in the UI
  const reviews = queryResult.data?.pages.flatMap((page) => (page.data ? page.data : [])) ?? [];

  // Pagination object from last loaded page
  const pagination = queryResult.data?.pages.length
    ? queryResult.data.pages[queryResult.data.pages.length - 1]?.pagination
    : undefined;

  return {
    ...queryResult,
    reviews,
    pagination,
  };
}
