'use client';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { userService } from '@/services/user.service';
import { RegisterInstructorPayload, User, UserProfileUpdatePayload } from '@/types/user';
import { ApiResponse } from '@/types/api-response';
import { adminService } from '@/services/admin.service';

export function useCurrentUser(
  options?: Partial<UseQueryOptions<ApiResponse<User | null>, null, User | null>>
) {
  return useQuery<ApiResponse<User | null>, null, User | null>({
    queryKey: QUERY_KEYS.users.current(),
    queryFn: ({ signal }) => userService.getCurrentUser({ signal }),
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes for current user
    enabled: options?.enabled ?? false,
    select: (data) => {
      // ApiResponse<User>
      return data && data.success ? data.data : null;
    },
    ...options,

    // retry: (failureCount, error: any) => {
    //   if (options?.retry === false) return false;
    //   if (typeof options?.retry === 'number') return failureCount < options.retry;

    //   const status = error?.response?.status;
    //   if (status === 401 || status === 403) return false; // Don't retry auth errors
    //   return failureCount < 2;
    // },
    meta: {
      errorMessage: 'Failed to load user profile',
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfileUpdatePayload>) => userService.updateUserProfile(data),
    onMutate: async (newProfile: Partial<UserProfileUpdatePayload>) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.current() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(QUERY_KEYS.users.current());

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), {
          ...previousUser,
          ...newProfile,
        });
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), context.previousUser);
      }
    },
    onSuccess: (updatedUser) => {
      // Update current user cache
      queryClient.setQueryData(QUERY_KEYS.users.current(), updatedUser);

      // Update user detail cache if exists
      queryClient.setQueryData(
        QUERY_KEYS.users.detail(updatedUser.success ? updatedUser.data.id : ''),
        updatedUser
      );

      // Invalidate related queries without refetching
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.all,
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile',
    },
  });
}
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, unknown, string, { previousUser?: ApiResponse<User> }>({
    mutationFn: (userId: string) => adminService.blockUser(userId),
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<ApiResponse<User>>(
        QUERY_KEYS.users.detail(userId)
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(userId), {
          ...previousUser,
          status: 'blocked',
        });
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), context.previousUser);
      }
    },
    onSuccess: (_, userId) => {
      // Update current user cache

      // Update user detail cache if exists
      queryClient.setQueryData(QUERY_KEYS.users.detail(userId), null);

      // Invalidate related queries without refetching
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.all,
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'User blocked successfully!',
      errorMessage: 'Failed to block user',
    },
  });
}
export function useUnBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.unBlockUser(userId),
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.detail(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<ApiResponse<User>>(
        QUERY_KEYS.users.detail(userId)
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.detail(userId), {
          ...previousUser,
          status: 'active',
        });
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), context.previousUser);
      }
    },
    onSuccess: (_, userId) => {
      // Update current user cache

      // Invalidate related queries without refetching
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.detail(userId),
      });
      // Invalidate related queries without refetching
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.all,
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'User blocked successfully!',
      errorMessage: 'Failed to block user',
    },
  });
}
export function useRegisterInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterInstructorPayload) =>
      userService.registerInstructor(payload as RegisterInstructorPayload),
    onMutate: async (newProfile) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.users.current() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(QUERY_KEYS.users.current());

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), {
          ...previousUser,
          ...newProfile,
        });
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(QUERY_KEYS.users.current(), context.previousUser);
      }
    },
    onSuccess: (updatedUser) => {
      // Update current user cache
      queryClient.setQueryData(QUERY_KEYS.users.current(), updatedUser);

      // Update user detail cache if exists
      queryClient.setQueryData(
        QUERY_KEYS.users.detail(updatedUser.success ? updatedUser.data.id : 'current'),
        updatedUser
      );

      // Invalidate related queries without refetching
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.users.all,
        refetchType: 'none',
      });
    },
    meta: {
      successMessage: 'Instructor registration successfully!',
      errorMessage: 'Instructor registration Failed',
    },
  });
}

// export function useUpdateUserAvatar() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: userService.updateAvatar,
//     onSuccess: (updatedUser) => {
//       queryClient.setQueryData(QUERY_KEYS.users.current(), updatedUser);
//       queryClient.setQueryData(QUERY_KEYS.users.detail(updatedUser.id), updatedUser);
//     },
//     meta: {
//       successMessage: 'Avatar updated successfully!',
//       errorMessage: 'Failed to update avatar',
//     },
//   });
// }
