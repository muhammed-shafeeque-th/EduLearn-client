'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user';
import { User, UserProfileUpdatePayload } from '@/types/user';
import { ApiResponse } from '@/types/api-response';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useAuthUserSelector } from '@/states/client';

/**
 * Hook to update the current user's profile.
 * Utilizes React Query's useMutation to update and keeps data in sync.
 *
 * @returns { mutate, isPending, error }
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const user = useAuthUserSelector();
  const authUserId = user?.userId ?? user?.id ?? 'current';

  const mutation = useMutation<ApiResponse<User>, Error, Partial<UserProfileUpdatePayload>>({
    mutationFn: (data) => userService.updateUserProfile(data),
    onSuccess: (response) => {
      // Invalidate and refetch relevant queries only if success
      if (response.success) {
        // Update cached current user data optimistically if possible
        queryClient.setQueryData(QUERY_KEYS.users.current(authUserId), response);
        if (response.data?.id) {
          queryClient.setQueryData(QUERY_KEYS.users.detail(response.data.id), response);
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all, refetchType: 'none' });
      }
    },

    meta: {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile.',
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
