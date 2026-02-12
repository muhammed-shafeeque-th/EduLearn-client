'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { cartService } from '@/services/cart.service';
import { useAuthSelector } from '@/states/client';
import { Cart } from '@/types/cart';

export function useCart(options?: { enabled?: boolean }) {
  const { user } = useAuthSelector();
  const queryClient = useQueryClient();
  const enabled = !!user?.userId && (options?.enabled ?? true);

  // Cart Query
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.cart.user(user?.userId || ''),
    queryFn: ({ signal }) => cartService.getCurrentUserCart({ signal }),
    enabled,
    staleTime: 30 * 1000,
    meta: {
      errorMessage: 'Failed to load cart',
    },
    select(response) {
      return response.success ? response.data : null;
    },
  });

  // Add To Cart
  const {
    mutateAsync: addToCartAsync,
    isPending: isAdding,
    error: addError,
  } = useMutation({
    mutationFn: ({ courseId }: { courseId: string }) => cartService.addToCart(courseId),
    onMutate: async ({ courseId }: { courseId: string }) => {
      if (!user?.userId) return;

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.cart.user(user?.userId) });

      const previousCart = queryClient.getQueryData<Cart>(QUERY_KEYS.cart.user(user?.userId));
      queryClient.setQueryData<Cart>(QUERY_KEYS.wishlist.user(user?.userId || ''), (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old?.items?.filter((item) => item.courseId !== courseId),
          total: old.total - 1,
        };
      });

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (user?.userId && context?.previousCart !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.cart.user(user?.userId), context.previousCart);
      }
    },
    onSuccess: () => {
      if (!user?.userId) return;

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.user(user?.userId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.current(),
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'Course added to cart!',
      errorMessage: 'Failed to add course to cart',
    },
  });

  // Remove from Cart
  const {
    mutateAsync: removeFromCartAsync,
    isPending: isRemoving,
    error: removeError,
  } = useMutation({
    mutationFn: ({ courseId }: { courseId: string }) => cartService.removeFromCart(courseId),
    onMutate: async ({ courseId }: { courseId: string }) => {
      if (!user?.userId) return;

      const previousCart = queryClient.getQueryData<Cart>(QUERY_KEYS.cart.user(user?.userId));
      queryClient.setQueryData<Cart>(QUERY_KEYS.cart.user(user?.userId || ''), (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old?.items?.filter((item) => item.courseId !== courseId),
          total: old.total - 1,
        };
      });

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (user?.userId && context?.previousCart !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.cart.user(user?.userId), context.previousCart);
      }
    },
    onSuccess: () => {
      if (!user?.userId) return;

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.user(user?.userId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.current(),
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'Course removed from cart!',
      errorMessage: 'Failed to remove course from cart',
    },
  });

  // Clear Cart
  const {
    mutateAsync: clearCartAsync,
    isPending: isClearing,
    error: clearError,
  } = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      if (!user?.userId) return;

      // Remove cart from cache
      queryClient.setQueryData(QUERY_KEYS.cart.user(user?.userId), []);
      queryClient.setQueryData(QUERY_KEYS.cart.user(user?.userId), 0);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.current(),
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'Cart cleared successfully!',
      errorMessage: 'Failed to clear cart',
    },
  });

  return {
    cart: data ?? null,
    isLoading,
    isError,
    error,
    isFetching,
    addToCart: addToCartAsync,

    isAdding,
    addError,
    removeFromCart: removeFromCartAsync,
    isRemoving,
    removeError,
    clearCart: clearCartAsync,
    isClearing,
    clearError,
    refetch,
  };
}

/**
 * Infinite query hook for cart items with pagination.
 * You must implement a paginated endpoint for Cart items on backend to make this effective.
 *
 * @param {Object} params - Options for pagination (page, pageSize, filters, etc).
 * @example
 *   const { data, fetchNextPage, hasNextPage } = useInfiniteCartItems({ pageSize: 10 });
 */
// export function useInfiniteCartItems(
//   params: { pageSize?: number; [key: string]: any } = {},
//   options?: { enabled?: boolean }
// ) {
//   const { user } = useAuthSelector();
//   const enabled = !!user?.userId && (options?.enabled ?? true);

//   return useInfiniteQuery({
//     queryKey: QUERY_KEYS.cart.infiniteItems(user?.userId, params),
//     // You need a paginated endpoint, e.g., cartService.getCartItemsPaginated:
//     queryFn: async ({ pageParam = 1 }) => {
//       // This assumes your backend supports this, you may need to adjust the call.
//       const response = await cartService.getCurrentUserCart({
//         ...params,
//         page: pageParam,
//         pageSize: params.pageSize,
//       });
//       if (!response.success) {
//         throw new Error(response.message || 'Failed to fetch cart items');
//       }
//       // The backend should include pagination info (hasNext, page, etc.)
//       // Assume the Cart object contains a pagination property
//       return {
//         items: response.data?.items ?? [],
//         pagination: response.pagination ?? {},
//         page: pageParam,
//       };
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => (lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined),
//     getPreviousPageParam: (firstPage) =>
//       firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined,
//     enabled,
//     staleTime: 30 * 1000,
//     meta: {
//       errorMessage: 'Failed to load cart items',
//     },
//   });
// }
