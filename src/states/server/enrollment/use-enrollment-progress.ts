import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  EnrollmentProgressResponse,
  UpdateLessonProgressPayload,
  SubmitQuizAttemptPayload,
  SignedVideoUrlResponse,
  EnrollmentDetail,
} from '@/types/enrollment/enrollment.type';
import { enrollmentService } from '@/services/enrollment.service';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useAuthUserSelector } from '@/states/client';
/**
 * Main hook for enrollment progress management
 */
export function useEnrollmentProgress(enrollmentId: string) {
  const queryClient = useQueryClient();

  const authUser = useAuthUserSelector();

  // QUERIES

  /**
   * Query: Get enrollment detail (structure + progress snapshot)
   * Cached for 5 minutes, used for initial page load
   */
  const enrollmentDetailQuery = useQuery({
    queryKey: QUERY_KEYS.enrollment.detail(authUser?.userId || 'current', enrollmentId),
    queryFn: ({ signal }) => enrollmentService.getEnrollment(enrollmentId, { signal }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnMount: false, // Don't refetch on remount within stale time
    refetchOnWindowFocus: false, // Don't refetch on focus
  });

  /**
   * Query: Get enrollment progress (frequently updated)
   * Shorter cache, used for real-time progress tracking
   */
  const progressQuery = useQuery({
    queryKey: QUERY_KEYS.enrollment.progress(enrollmentId),
    queryFn: ({ signal }) => enrollmentService.getEnrollmentProgress(enrollmentId, { signal }),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // refetchOnMount: 'always', // Always get fresh progress on mount
    // refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select(data) {
      return data.success ? data.data : null;
    },
  });

  // MUTATIONS

  /**
   * Mutation: Update lesson progress with optimistic updates
   */
  const updateLessonMutation = useMutation({
    mutationFn: ({
      lessonId,
      payload,
      signal,
    }: {
      lessonId: string;
      payload: UpdateLessonProgressPayload;
      signal?: AbortSignal;
    }) => enrollmentService.updateLessonProgress(enrollmentId, lessonId, payload, { signal }),

    // Optimistic update
    onMutate: async ({ lessonId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.enrollment.progress(enrollmentId),
      });

      const previousProgress = queryClient.getQueryData<{ data: EnrollmentProgressResponse }>(
        QUERY_KEYS.enrollment.progress(enrollmentId)
      );

      if (previousProgress) {
        const optimisticProgress = {
          ...previousProgress,
          data: {
            ...previousProgress.data,
            lessons: previousProgress.data?.lessons.map((lesson) => {
              if (lesson.lessonId !== lessonId) return lesson;

              // Logic to ensure completed doesn't revert to false if it was already true
              const isNowCompleted = lesson.completed || payload.event === 'completed';

              const newWatchTime = Math.max(payload.currentTime, lesson.watchTime || 0);

              // Prevent division by zero
              const duration = payload.duration || lesson.duration || 1;
              const progressPercent = Math.min((newWatchTime / duration) * 100, 100);

              return {
                ...lesson,
                watchTime: newWatchTime,
                duration,
                progressPercent: Math.round(progressPercent),
                completed: isNowCompleted, // Use the derived boolean
                completedAt:
                  isNowCompleted && !lesson.completed
                    ? new Date().toISOString()
                    : lesson.completedAt,
              };
            }),
          },
        };

        queryClient.setQueryData(QUERY_KEYS.enrollment.progress(enrollmentId), optimisticProgress);
      }

      return { previousProgress };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      console.error('Lesson progress update failed:', err);
      if (context?.previousProgress) {
        queryClient.setQueryData(
          QUERY_KEYS.enrollment.progress(enrollmentId),
          context.previousProgress
        );
      }
    },

    // Refetch on success to get authoritative data
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.enrollment.progress(enrollmentId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.enrollment.detail(authUser?.userId || 'current', enrollmentId),
      });
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: QUERY_KEYS.enrollment.progress(enrollmentId),
    //   });
    // },
  });

  /**
   * Mutation: Submit quiz attempt
   */
  const submitQuizMutation = useMutation({
    mutationFn: async ({
      quizId,
      payload,
    }: {
      quizId: string;
      payload: SubmitQuizAttemptPayload;
    }) => {
      const response = await enrollmentService.submitQuizAttempt(enrollmentId, quizId, payload);
      if (!response?.success) {
        throw new Error(response.message);
      }
      return response.data;
    },

    onSuccess: (data) => {
      // Invalidate progress to refetch with new quiz results
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.enrollment.progress(enrollmentId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.enrollment.detail(authUser?.userId || 'current', enrollmentId),
      });

      // Show milestone if achieved
      if (data.milestone) {
        console.log('Milestone achieved:', data.milestone);
      }
    },

    onError: (err) => {
      console.error('Quiz submission failed:', err);
    },
  });

  // VIDEO URL MANAGEMENT

  /**
   * Get signed video URL (cached per lesson)
   */
  const getSignedVideoUrl = useCallback(
    async (lessonId: string, signal: AbortSignal): Promise<SignedVideoUrlResponse> => {
      return queryClient.fetchQuery({
        queryKey: QUERY_KEYS.enrollment.videoUrl(enrollmentId, lessonId),
        queryFn: async () => {
          const response = await enrollmentService.getSignedVideoUrl(enrollmentId, lessonId, {
            signal,
          });
          if (!response?.success) {
            throw new Error(response.message);
          }
          return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes (URLs expire quickly)
        gcTime: 5 * 60 * 1000, // 5 minutes,
      });
    },
    [enrollmentId, queryClient]
  );

  const prefetchVideoUrl = useCallback(
    async (lessonId: string) => {
      // We use the exact same Query Key and Query Function as getSignedVideoUrl
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.enrollment.videoUrl(enrollmentId, lessonId),
        queryFn: async ({ signal }) => {
          const response = await enrollmentService.getSignedVideoUrl(enrollmentId, lessonId, {
            signal,
          });
          if (!response?.success) throw new Error(response.message);
          return response.data;
        },
        // IMPORTANT: Match the staleTime of your main query (2 mins)
        // This prevents re-fetching if the user clicks 10 seconds after hovering
        staleTime: 2 * 60 * 1000,
      });
    },
    [enrollmentId, queryClient]
  );

  /**
   * Refresh signed video URL
   */
  const refreshVideoUrl = useCallback(
    async (lessonId: string, signal?: AbortSignal): Promise<SignedVideoUrlResponse> => {
      try {
        const response = await enrollmentService.refreshVideoUrl(enrollmentId, lessonId, {
          signal,
        });
        if (!response?.success) {
          throw new Error(response.message);
        }
        // Update cache with new URL
        queryClient.setQueryData(
          QUERY_KEYS.enrollment.videoUrl(enrollmentId, lessonId),
          response.data
        );
        return response.data;
      } catch (error) {
        toast.error({ title: "Couldn't refresh video url", description: getErrorMessage(error) });
        throw error;
      }
    },
    [enrollmentId, queryClient]
  );

  // HELPER FUNCTIONS

  /**
   * Get lesson progress by ID from cache
   */
  const getLessonProgress = useCallback(
    (lessonId: string) => {
      const progress = progressQuery.data;
      if (!progress) return null;
      return progress.lessons.find((l) => l.lessonId === lessonId) || null;
    },
    [progressQuery.data]
  );

  /**
   * Get quiz progress by ID from cache
   */
  const getQuizProgress = useCallback(
    (quizId: string) => {
      const progress = progressQuery.data;
      if (!progress) return null;
      return progress.quizzes.find((q) => q.quizId === quizId) || null;
    },
    [progressQuery.data]
  );

  /**
   * Check if item is completed
   */
  const isItemCompleted = useCallback(
    (itemId: string, type: 'lesson' | 'quiz'): boolean => {
      if (type === 'lesson') {
        const lesson = getLessonProgress(itemId);
        return lesson?.completed ?? false;
      } else {
        const quiz = getQuizProgress(itemId);
        return quiz?.completed ?? false;
      }
    },
    [getLessonProgress, getQuizProgress]
  );

  // RETURN API

  return {
    // Queries
    enrollmentDetail: enrollmentDetailQuery.data?.success
      ? enrollmentDetailQuery.data.data
      : ([] as unknown as EnrollmentDetail),
    progress: progressQuery.data,

    // Loading states
    isLoadingDetail: enrollmentDetailQuery.isLoading,
    isLoadingProgress: progressQuery.isLoading,
    isLoading: enrollmentDetailQuery.isLoading || progressQuery.isLoading,

    // Error states
    errorDetail: enrollmentDetailQuery.error,
    errorProgress: progressQuery.error,

    // Refetch functions
    refetchDetail: enrollmentDetailQuery.refetch,
    refetchProgress: progressQuery.refetch,

    // Mutations
    // updateLessonProgress now accepts an optional signal param
    updateLessonProgress: (
      lessonId: string,
      payload: UpdateLessonProgressPayload,
      signal?: AbortSignal
    ) => updateLessonMutation.mutateAsync({ lessonId, payload, signal }),

    submitQuizAttempt: (quizId: string, payload: SubmitQuizAttemptPayload) =>
      submitQuizMutation.mutateAsync({ quizId, payload }),

    // Mutation states
    isUpdatingLesson: updateLessonMutation.isPending,
    isSubmittingQuiz: submitQuizMutation.isPending,

    // Video URL helpers
    getSignedVideoUrl,
    refreshVideoUrl,
    prefetchVideoUrl,

    // Helper functions
    getLessonProgress,
    getQuizProgress,
    isItemCompleted,
  };
}

/**
 * Hook specifically for video player
 * Includes debouncing logic for timeupdate events
 */
export function useVideoProgress(enrollmentId: string) {
  const { updateLessonProgress, getLessonProgress, getSignedVideoUrl, refreshVideoUrl } =
    useEnrollmentProgress(enrollmentId);

  // Debounced update for timeupdate events
  // updateProgress now accepts an optional signal
  const updateProgress = useCallback(
    async (
      lessonId: string,
      currentTime: number,
      duration: number,
      isCompleted = false,
      signal?: AbortSignal
    ) => {
      console.log('Calling update progress with ', { currentTime, duration, isCompleted });
      try {
        await updateLessonProgress(
          lessonId,
          {
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            event: isCompleted ? 'completed' : 'timeupdate',
          },
          signal
        );
      } catch (error) {
        console.error('Failed to update lesson progress:', error);
      }
    },
    [updateLessonProgress]
  );

  return {
    updateProgress,
    getSignedVideoUrl,
    refreshVideoUrl,
    getLessonProgress,
  };
}
