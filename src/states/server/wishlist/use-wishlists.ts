'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { wishlistService } from '@/services/wishlist.service';
import { useAuthSelector } from '@/states/client';
import { Wishlist } from '@/types/wishlist';
import { toast } from '../../../hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

/**
 * Aggregate hook to manage wishlist data, mutations, and states in a unified API.
 */
export function useWishlist(options?: { enabled?: boolean }) {
  const { user } = useAuthSelector();
  const queryClient = useQueryClient();

  const {
    data: wishlistData,
    isLoading: isWishlistLoading,
    isFetching: isWishlistFetching,
    isError: isWishlistError,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: QUERY_KEYS.wishlist.user(user?.userId || ''),
    queryFn: ({ signal }) => wishlistService.getCurrentUserWishlist({ signal }),
    enabled: !!user?.userId && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    meta: {
      errorMessage: 'Failed to load wishlist',
    },
    select(data) {
      return data.success ? data : undefined;
    },
  });

  const {
    mutateAsync: addToWishlist,
    isPending: isAdding,
    isSuccess: isAddSuccess,
    isError: isAddError,
    error: addError,
  } = useMutation({
    mutationFn: ({ courseId }: { courseId: string }) => wishlistService.addToWishlist(courseId),
    onMutate: async ({ courseId }) => {
      if (!user?.userId) return;
      const previousWishlist = queryClient.getQueryData<Wishlist>(
        QUERY_KEYS.wishlist.user(user?.userId)
      );
      queryClient.setQueryData<Wishlist>(QUERY_KEYS.wishlist.user(user?.userId), (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items?.map((item) =>
            item.courseId === courseId
              ? { ...item, course: { ...item.course, isInCart: true } }
              : item
          ),
        };
      });
      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      if (user?.userId && context?.previousWishlist !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.wishlist.user(user?.userId), context.previousWishlist);
      }
      toast.error({
        title: 'Error',
        description: 'Failed to add course to wishlist. Please try again.',
      });
    },
    onSuccess: () => {
      if (!user?.userId) return;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId) });
      toast.success({
        title: 'Added to wishlist',
        description: 'Course has been added to your wishlist.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId || '') });
    },
    meta: {
      successMessage: 'Course added to wishlist!',
      errorMessage: 'Failed to add course to wishlist',
    },
  });

  const {
    mutateAsync: removeFromWishlist,
    isPending: isRemoving,
    isSuccess: isRemoveSuccess,
    isError: isRemoveError,
    error: removeError,
  } = useMutation({
    mutationFn: ({ courseId }: { courseId: string }) =>
      wishlistService.removeFromWishlist(courseId),
    onMutate: async ({ courseId }) => {
      if (!user?.userId) return;
      const previousWishlist = queryClient.getQueryData<Wishlist>(
        QUERY_KEYS.wishlist.user(user?.userId)
      );
      queryClient.setQueryData<Wishlist>(QUERY_KEYS.wishlist.user(user?.userId), (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old?.items?.filter((item) => item.courseId !== courseId),
          total: old.total - 1,
        };
      });
      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      if (user?.userId && context?.previousWishlist !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.wishlist.user(user?.userId), context.previousWishlist);
      }
      toast.error({
        title: 'Error',
        description: getErrorMessage(
          error,
          'Failed to remove course from wishlist. Please try again.'
        ),
      });
    },
    onSuccess: () => {
      if (!user?.userId) return;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId) });
      toast.success({
        title: 'Removed from wishlist',
        description: 'Course has been removed from your wishlist.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId || '') });
    },
    meta: {
      successMessage: 'Course removed from wishlist!',
      errorMessage: 'Failed to remove course from wishlist',
    },
  });

  const {
    mutateAsync: toggleWishlist,
    isPending: isToggling,
    isSuccess: isToggleSuccess,
    isError: isToggleError,
    error: toggleError,
  } = useMutation({
    mutationFn: ({ courseId }: { courseId: string }) =>
      wishlistService.toggleWishlistItem(courseId),
    onMutate: async () => {
      if (!user?.userId) return;
      const previousWishlist = queryClient.getQueryData<Wishlist>(
        QUERY_KEYS.wishlist.user(user?.userId)
      );

      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      if (user?.userId && context?.previousWishlist !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.wishlist.user(user?.userId), context.previousWishlist);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId || '') });
    },
    onSuccess: () => {
      if (!user?.userId) return;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.user(user?.userId || '') });
    },
    meta: {
      successMessage: 'Wishlist updated!',
      errorMessage: 'Failed to update wishlist',
    },
  });

  return {
    wishlist: wishlistData?.data ?? null,
    pagination: wishlistData?.pagination ?? null,
    isLoading: isWishlistLoading,
    isFetching: isWishlistFetching,
    isError: isWishlistError,
    error: wishlistError,
    refetch: refetchWishlist,

    addToWishlist,
    isAdding,
    isAddSuccess,
    isAddError,
    addError,

    removeFromWishlist,
    isRemoving,
    isRemoveSuccess,
    isRemoveError,
    removeError,

    toggleWishlist,
    isToggling,
    isToggleSuccess,
    isToggleError,
    toggleError,
  };
}
