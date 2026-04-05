'use client';

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { userService } from '@/services/user';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { ApiResponse } from '@/types/api-response';
import { User, UserProfileUpdatePayload } from '@/types/user';
import { adminService } from '@/services/admin';

/**
 * Admin hook for fetching and mutating a user's data.
 * Exposes full control and status for each mutation and query, to make UI logic easier.
 */
export function useAdminUser(
  userId?: string,
  options?: Partial<UseQueryOptions<ApiResponse<User | null>, null, User | null>>
) {
  const queryClient = useQueryClient();

  const isEnabled = !!userId && (options?.enabled || false);

  // --- Get user details ---
  const {
    data: user,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery<ApiResponse<User | null>, null, User | null>({
    queryKey: QUERY_KEYS.users.detail(userId || ''),
    queryFn: ({ signal }) => userService.getUser(userId!, { signal }),
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
    enabled: isEnabled,
    select: (data) => (data?.success ? data.data : null),
    ...options,
    meta: {
      errorMessage: 'Failed to load user profile',
    },
  });

  // --- Update user profile ---
  const {
    mutateAsync: updateUserProfile,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
    reset: resetUpdate,
  } = useMutation({
    mutationFn: (data: Partial<UserProfileUpdatePayload>) => userService.updateUserProfile(data),
    onMutate: async (newProfile: Partial<UserProfileUpdatePayload>) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(userId || '') });
      const previous = queryClient.getQueryData<User>(QUERY_KEYS.users.detail(userId || ''));
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(userId || ''), {
          ...previous,
          ...newProfile,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(userId || ''), ctx.previous);
      }
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.list({}) });
      if (updatedUser?.success && updatedUser.data) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(updatedUser.data.id), updatedUser.data);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all, refetchType: 'none' });
      }
    },
    meta: {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile',
    },
  });

  // --- Block account ---
  const {
    mutateAsync: blockAccount,
    isPending: isBlockingAccount,
    isSuccess: isBlockAccountSuccess,
    isError: isBlockAccountError,
    error: blockAccountError,
    reset: resetBlockAccount,
  } = useMutation({
    mutationFn: (mutateUserId: string) => adminService.blockAccount(mutateUserId),
    onMutate: async (mutateUserId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(mutateUserId) });
      const previous = queryClient.getQueryData<User>(QUERY_KEYS.users.detail(mutateUserId));
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(mutateUserId), {
          ...previous,
          accountStatus: 'blocked',
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && _vars) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(_vars), ctx.previous);
      }
    },
    onSuccess: (_res, mutateUserId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.list({}) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all, refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(mutateUserId) });
    },
    meta: {
      successMessage: 'Account blocked successfully!',
      errorMessage: 'Failed to block account',
    },
  });

  // --- Unblock account ---
  const {
    mutateAsync: unblockAccount,
    isPending: isUnblockingAccount,
    isSuccess: isUnblockAccountSuccess,
    isError: isUnblockAccountError,
    error: unblockAccountError,
    reset: resetUnblockAccount,
  } = useMutation({
    mutationFn: (mutateUserId: string) => adminService.unblockAccount(mutateUserId),
    onMutate: async (mutateUserId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(mutateUserId) });
      const previous = queryClient.getQueryData<User>(QUERY_KEYS.users.detail(mutateUserId));
      if (previous) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(mutateUserId), {
          ...previous,
          accountStatus: 'active',
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && _vars) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(_vars), ctx.previous);
      }
    },
    onSuccess: (_res, mutateUserId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.list({}) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(mutateUserId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all, refetchType: 'none' });
    },
    meta: {
      successMessage: 'Account unblocked successfully!',
      errorMessage: 'Failed to unblock account',
    },
  });

  // --- Delete user ---
  const {
    mutateAsync: deleteUser,
    isPending: isDeleting,
    isSuccess: isDeleteSuccess,
    isError: isDeleteError,
    error: deleteError,
    reset: resetDelete,
  } = useMutation({
    mutationFn: (deleteUserId: string) => adminService.deleteUser(deleteUserId),
    // Remove destructive cache operation. Instead, just return previous for robust rollback.
    onMutate: async (deleteUserId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(deleteUserId) });
      const previous = queryClient.getQueryData<User>(QUERY_KEYS.users.detail(deleteUserId));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && _vars) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(_vars), ctx.previous);
      }
    },
    onSuccess: (_res, deletedUserId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(deletedUserId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all, refetchType: 'none' });
    },
    meta: {
      successMessage: 'User deleted successfully!',
      errorMessage: 'Failed to delete user',
    },
  });

  return {
    // Query state
    user: user ?? null,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,

    // Update profile
    updateUserProfile,
    isUpdating,
    isUpdateSuccess,
    isUpdateError,
    updateError,
    resetUpdate,

    // Block account
    blockAccount,
    isBlockingAccount,
    isBlockAccountSuccess,
    isBlockAccountError,
    blockAccountError,
    resetBlockAccount,

    // Unblock account
    unblockAccount,
    isUnblockingAccount,
    isUnblockAccountSuccess,
    isUnblockAccountError,
    unblockAccountError,
    resetUnblockAccount,

    deleteUser,
    isDeleting,
    isDeleteSuccess,
    isDeleteError,
    deleteError,
    resetDelete,
  };
}
