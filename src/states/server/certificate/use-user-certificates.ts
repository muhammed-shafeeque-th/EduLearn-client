'use client';

import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment.service';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useAuthUserSelector } from '@/states/client';

export function useUserCertificates(options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();

  return useQuery({
    queryKey: QUERY_KEYS.certificates.byUser(authUser?.userId || 'current'),
    queryFn: async ({ signal }) => {
      const result = await enrollmentService.getUserCertificates({ signal });
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch certificates');
      }
      return result.data;
    },
    enabled: !!authUser && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}
