'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useAuthSelector, useAuthUserSelector } from '@/states/client';
import { walletService } from '@/services/wallet.service';
import type { WalletParams } from '@/services/wallet.service';

/**
 * Hook to fetch the current user's wallet.
 * @param options Optional query options.
 */
export function useCurrentUserWallet(options?: { enabled?: boolean }) {
  const { user } = useAuthSelector();
  const enabled = Boolean(user?.userId) && (options?.enabled ?? true);

  const authUser = useAuthUserSelector();

  const query = useQuery({
    queryKey: QUERY_KEYS.wallet.user(authUser?.userId || 'current'),
    queryFn: ({ signal }) => walletService.getCurrentUserWallet({ signal }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    meta: {
      errorMessage: 'Failed to load wallet',
    },
    select(response) {
      return response.success ? response.data : null;
    },
  });

  // Standardize return for best practice, allow extension in the future.
  return {
    wallet: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

/**
 * Infinite query hook for paginated wallet transactions for the current user.
 * The backend must return paginated results with total, page, pageSize, hasNext, hasPrev, etc.
 *
 * @param params Pagination/filter params (pageSize, sortOrder, etc).
 * @param options Query options.
 * @example
 *   const { data, fetchNextPage, hasNextPage } = useInfiniteWalletTransactions({ pageSize: 10 });
 */
export function useInfiniteWalletTransactions(
  params: WalletParams = {},
  options?: { enabled?: boolean }
) {
  const { user } = useAuthSelector();
  const enabled = Boolean(user?.userId) && (options?.enabled ?? true);

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.wallet.transactions(user?.userId ?? '', params),
    queryFn: async ({ pageParam = 1, signal }) => {
      // Supports backend with standard paginated response
      const response = await walletService.getWalletTransactions(
        {
          ...params,
          page: pageParam,
          pageSize: params.pageSize,
        },
        { signal }
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch wallet transactions');
      }

      // Assume response.data is an array & pagination is with response.pagination
      // Fallback: If pagination is not present, can extend data structure as needed.
      // WalletTransaction[] as response.data, e.g. { data: WalletTransaction[], pagination: { total, page, ... } }
      return {
        items: Array.isArray(response.data) ? response.data : [],
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined),
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined,
    enabled,
    staleTime: 30 * 1000,
    meta: {
      errorMessage: 'Failed to load wallet transactions',
    },
  });
}
