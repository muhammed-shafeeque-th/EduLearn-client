'use client';

import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { userService, UsersParams } from '@/services/user';

/**
 * Fetch a paginated list of users.
 * @param params Query parameters (search, page, etc).
 * @param options Additional react-query useQuery options.
 */
export function useUsers(
  params: Partial<UsersParams> = {},
  options: Partial<Parameters<typeof useQuery>[1] & { enabled: boolean }> = {}
) {
  const { data, isLoading, isError, error, isFetching, isSuccess, refetch } = useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: ({ signal }) => userService.getUsers(params, { signal }),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    select: (data) =>
      data.success
        ? data
        : {
            data: [],
            pagination: undefined,
          },
    meta: {
      errorMessage: 'Failed to load users',
    },
    ...options,
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return {
    users,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  };
}

/**
 * Fetch a single user by ID.
 * @param id User ID.
 * @param options useQuery options, including enabled.
 */
export function useUser(
  id: string,
  options: Partial<Parameters<typeof useQuery>[1] & { enabled: boolean }> = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id),
    queryFn: ({ signal }) => userService.getUser(id, { signal }),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    select: (data) => (data.success ? data.data : null),
    meta: {
      errorMessage: 'Failed to load user details',
    },
    ...options,
  });
}

/**
 * Fetch users with infinite scroll/pagination support.
 * @param params Query parameters excluding 'page'.
 * @param options Additional useInfiniteQuery options.
 */
export function useUsersInfinite(
  params: Omit<UsersParams, 'page'> = {},
  options: Partial<Parameters<typeof useInfiniteQuery>[1]> = {}
) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: ({ pageParam = 1, signal }) =>
      userService.getUsers({ ...params, page: pageParam }, { signal }),
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
      errorMessage: 'Failed to load users',
    },
    ...options,
  });
}

/**
 * Fetch list of all instructors.
 * @param options useQuery options (optional).
 */
export function useInstructors(
  params: Partial<UsersParams> = {},
  options: Partial<Parameters<typeof useQuery>[1]> = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.users.instructors(params),
    queryFn: ({ signal }) => userService.getUsers({ ...params, role: 'instructor' }, { signal }),
    staleTime: 10 * 60 * 1000,
    select: (data) =>
      data.success
        ? {
            instructors: data.data,
            ...data.pagination,
          }
        : {
            instructors: [],
            total: 0,
            page: 1,
            totalPages: 0,
          },
    meta: {
      errorMessage: 'Failed to load instructors',
    },
    ...options,
  });
}
