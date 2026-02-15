import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment.service';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { SubmitCourseReviewPayload } from '@/types/enrollment/enrollment.type';
import { Review } from '@/types/course';
import { RequestOptions } from '@/services/base-service';

export function useEnrollmentReview(enrollmentId: string) {
  const queryClient = useQueryClient();

  // Fetch the course review for this enrollment, or null if none
  const reviewQuery = useQuery({
    queryKey: QUERY_KEYS.review.enrollment(enrollmentId),
    queryFn: async ({ signal }) => {
      try {
        const result = await enrollmentService.getCourseReviewByEnrollment(enrollmentId, {
          signal,
        });
        if (!result.success || !result.data) {
          return null;
        }
        return result.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Submit a new course review for this enrollment
  const submitCourseReview = useMutation({
    mutationFn: (request: { payload: SubmitCourseReviewPayload; options?: RequestOptions }) =>
      enrollmentService.submitCourseReview(enrollmentId, request.payload, request.options),
    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });

      const previousReview = queryClient.getQueryData<Review>(
        QUERY_KEYS.review.enrollment(enrollmentId)
      );

      // Optimistically set review in cache
      queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), {
        ...previousReview,
        ...payload,
      });

      return { previousReview };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousReview) {
        queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), ctx.previousReview);
      }
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) return;
      const review = response.data;
      queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), review);
      queryClient.setQueryData(QUERY_KEYS.review.id(review.id), review);

      // Invalidate all review lists, do not force refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.all, refetchType: 'none' });
    },
    meta: {
      successMessage: 'Review submitted successfully!',
      errorMessage: 'Failed to submit review',
    },
  });

  // Update an existing course review for this enrollment
  const updateCourseReview = useMutation({
    mutationFn: (request: {
      reviewId: string;
      payload: SubmitCourseReviewPayload;
      options?: RequestOptions;
    }) =>
      enrollmentService.updateCourseReview(
        enrollmentId,
        request.reviewId,
        request.payload,
        request.options
      ),
    onMutate: async ({ reviewId, payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });

      const previousReview = queryClient.getQueryData<Review>(
        QUERY_KEYS.review.enrollment(enrollmentId)
      );

      // Optimistic UI
      if (previousReview) {
        queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), {
          ...previousReview,
          ...payload,
        });
      }

      return { previousReview, reviewId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousReview) {
        queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), ctx.previousReview);
      }
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) return;
      const updatedReview = response.data;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });
      queryClient.setQueryData(QUERY_KEYS.review.id(updatedReview.id), updatedReview);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.all, refetchType: 'none' });
    },
    meta: {
      successMessage: 'Review updated successfully!',
      errorMessage: 'Failed to update review',
    },
  });

  // Delete a course review for this enrollment
  const deleteCourseReview = useMutation({
    mutationFn: (request: { reviewId: string; options?: RequestOptions }) =>
      enrollmentService.deleteCourseReview(enrollmentId, request.reviewId, request.options),
    onMutate: async ({ reviewId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });

      const previousReview = queryClient.getQueryData<Review>(
        QUERY_KEYS.review.enrollment(enrollmentId)
      );

      queryClient.setQueryData(QUERY_KEYS.review.enrollment(enrollmentId), null);
      queryClient.setQueryData(QUERY_KEYS.review.id(reviewId), null);

      return { previousReview, reviewId };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.id(ctx?.reviewId || '') });
    },
    onSuccess: (_resp, variables) => {
      if (variables?.reviewId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.enrollment(enrollmentId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.id(variables.reviewId) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review.all, refetchType: 'none' });
    },
    meta: {
      successMessage: 'Review deleted successfully!',
      errorMessage: 'Failed to delete review',
    },
  });

  return {
    // Data
    review: reviewQuery.data,
    hasReview: !!reviewQuery.data,

    // Loading/error states
    isLoading: reviewQuery.isLoading,
    isSubmitting: submitCourseReview.isPending,
    isUpdating: updateCourseReview.isPending,
    isDeleting: deleteCourseReview.isPending,
    error:
      reviewQuery.error ||
      submitCourseReview.error ||
      updateCourseReview.error ||
      deleteCourseReview.error,

    // Actions
    submitCourseReview: submitCourseReview.mutateAsync,
    updateCourseReview: updateCourseReview.mutateAsync,
    deleteCourseReview: deleteCourseReview.mutateAsync,
    refetch: reviewQuery.refetch,
  };
}
