'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { adminService } from '@/services/admin.service';

/**
 * Custom hook to fetch system overview stats for the admin dashboard.
 * Follows React Query best practices.
 */
export function useSystemOverview(options?: { enabled?: boolean; staleTime?: number }) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.systemOverview(),
    queryFn: async ({ signal }) => {
      const response = await adminService.getSystemOverview({ signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load system overview',
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
export function useRevenueStats(options?: { enabled?: boolean; staleTime?: number }) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.admin.revenueStats(),
    queryFn: async ({ signal }) => {
      const response = await adminService.getRevenueStats('', { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch system overview');
      }
      return response.data;
    },
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // default 10 minutes
    enabled: options?.enabled ?? true,
    meta: {
      errorMessage: 'Failed to load system overview',
    },
  });

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
