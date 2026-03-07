'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { InstructorMeta } from '@/types/user';
import { ApiResponse } from '@/types/api-response';
import { userService, type UsersParams } from '@/services/user.service';

/**
 * Parameters for querying instructors.
 */
export interface UseInstructorsParams {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: 'student' | 'instructor' | 'admin';
  status?: 'active' | 'inactive';
}

type UseInstructorsOptions = {
  enabled?: boolean;
  staleTime?: number;
  placeholderData?: ApiResponse<InstructorMeta[]> | undefined;
};

/**
 * Hook providing instructor list, states, and status flags for consumers.
 */
export function useInstructors(params: UseInstructorsParams = {}, options?: UseInstructorsOptions) {
  const effectiveParams: UsersParams = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 12,
    ...params,
  };

  // UseQuery
  const query = useQuery<ApiResponse<InstructorMeta[]>, Error>({
    queryKey: QUERY_KEYS.users.instructors(effectiveParams),
    queryFn: ({ signal }) => userService.getInstructors(effectiveParams, { signal }),
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
    placeholderData: options?.placeholderData ?? keepPreviousData,
    meta: {
      errorMessage: 'Failed to load instructors',
    },
  });

  const data = query.data;
  const instructors = data?.success ? data.data : [];
  const pagination = data?.success ? data.pagination : undefined;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? effectiveParams.page;

  return {
    instructors,
    pagination,
    totalPages,
    totalCount,
    currentPage,
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetched: query.isFetched,
    query,
  };
}
