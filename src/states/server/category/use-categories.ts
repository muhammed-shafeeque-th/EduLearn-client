'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { categoryService } from '@/services/category';

//  QUERIES

/**
 * Fetches all active categories .
 */
export function useCategories() {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.categories.active(),
    queryFn: ({ signal }) => categoryService.getCategories({ signal }),
    staleTime: 10 * 60 * 1000, // 10 minutes – categories change infrequently
    select: (data) => (data.success ? (data.data ?? []) : []),
    meta: {
      errorMessage: 'Failed to load categories',
    },
  });

  return {
    categories: data ?? [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}

/**
 * Admin version – fetches all categories including inactive & deleted for management UI.
 * Uses the same endpoint but a different query key so admin invalidations don't
 * flush the public cache.
 */
export function useAdminCategories(includeDeleted = false) {
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.categories.admin(),
    queryFn: ({ signal }) =>
      categoryService.getCategories({
        signal,
        params: includeDeleted ? { includeDeleted: true } : {},
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes – admin needs fresher data
    select: (data) => (data.success ? (data.data ?? []) : []),
    meta: {
      errorMessage: 'Failed to load categories',
    },
  });

  return {
    categories: data ?? [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
}
