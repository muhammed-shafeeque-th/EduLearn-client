'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { OrderParams, orderService } from '@/services/order.service';
import { useAuthUserSelector } from '@/states/client';

/**
 * Hook for fetching and mutating a single order by ID.
 *
 * @param orderId - The order ID
 * @param options - Optional options (enabled flag controls query execution)
 * @returns Order data, mutation(s), and relevant states
 */
export function useOrder(orderId: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const authUser = useAuthUserSelector();

  const enabled = !!orderId && (options?.enabled ?? true);

  // Fetch individual order
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.orders.detail(orderId),
    queryFn: ({ signal }) => orderService.getOrder(orderId, { signal }),
    enabled,
    staleTime: 5 * 60 * 1000,
    meta: { errorMessage: 'Failed to load order details' },
    select: (data) => (data.success ? data.data : null),
  });

  // Example mutation: restore order (customize as needed)
  const {
    mutateAsync: restoreOrder,
    isPending: isRestoring,
    isSuccess: isRestored,
    error: restoreError,
    reset: resetRestore,
  } = useMutation({
    mutationFn: () => orderService.restoreOrder(orderId),
    onSuccess: async () => {
      // Invalidate relevant order queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.orders.list(authUser?.userId || 'current', {}),
        }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId) }),
      ]);
    },
    meta: {
      successMessage: 'Order restored successfully!',
      errorMessage: 'Failed to restore order',
    },
  });

  // More mutations (e.g. cancelOrder, updateOrder, etc.) can be implemented similarly

  return {
    order,
    isLoading,
    isError,
    error,
    refetch,
    // restore mutation API
    restoreOrder,
    isRestoring,
    isRestored,
    restoreError,
    resetRestore,
  };
}

export function useOrdersInfinite(params: Partial<Omit<OrderParams, 'page'>> = {}) {
  const authUser = useAuthUserSelector();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.orders.list(authUser?.userId || 'current', {}),
    queryFn: ({ pageParam = 1, signal }) =>
      orderService.getOrders({ ...params, page: pageParam }, { signal }),
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
      errorMessage: 'Failed to load orders',
    },
  });
}
