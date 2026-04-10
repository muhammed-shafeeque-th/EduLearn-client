'use client';

import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useAuthUserSelector } from '@/states/client';

export function useUserCertificates(options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();
  const isEnabled = !!authUser?.userId && (options?.enabled ?? true);

  const queryResult = useQuery({
    queryKey: QUERY_KEYS.certificates.byUser(authUser?.userId || 'current'),
    queryFn: async ({ signal }) => enrollmentService.getUserCertificates({ signal }),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });
  const certificates = queryResult.data?.success ? queryResult.data.data : [];
  const pagination = queryResult.data?.success ? queryResult.data.pagination : {};

  return {
    certificates,
    pagination,
    isLoading: queryResult.isLoading,
    certificatesError: queryResult.error,
    query: queryResult,
  };
}
