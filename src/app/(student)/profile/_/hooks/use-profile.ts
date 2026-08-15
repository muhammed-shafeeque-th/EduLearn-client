'use client';
import { useCallback } from 'react';
import { useUpdateUserProfile } from '@/states/server/user/use-current-user';
import { UserProfileType } from '../schemas';
import { useToast } from '@/hooks/use-toast';
import { triggerClientRefresh } from '@/lib/auth/auth-client-apis';
import { UserProfileUpdatePayload } from '@/types/user';
import { getErrorMessage } from '@/lib/utils';

export function useProfileForm() {
  const {
    mutateAsync: updateUserProfile,
    isError,
    error,
    isPending,
    isSuccess,
  } = useUpdateUserProfile();
  const { toast } = useToast();

  const handleSubmit = useCallback(
    async (updatedData: UserProfileType) => {
      let timer: NodeJS.Timeout | null = null;

      // Object.fromEntries(Object.entries(updatedData).filter(([_, value]) => !!value));

      const socials: UserProfileUpdatePayload['socials'] = [
        ...(updatedData.socials.facebook
          ? [{ provider: 'facebook', profileUrl: updatedData.socials.facebook }]
          : []),
        ...(updatedData.socials.instagram
          ? [{ provider: 'instagram', profileUrl: updatedData.socials.instagram }]
          : []),
        ...(updatedData.socials.linkedin
          ? [{ provider: 'linkedin', profileUrl: updatedData.socials.linkedin }]
          : []),
      ];

      const updatePayload: UserProfileUpdatePayload = {
        ...updatedData,
        socials,
      };

      try {
        const result = await updateUserProfile(updatePayload);
        if (result?.success || isSuccess) {
          toast.success({
            title: 'Update successful',
            description: result?.message || 'User data updated',
          });

          // Trigger a refresh token after 2 sec
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(async () => {
            await triggerClientRefresh();
          }, 2000);
          return;
        }
        if (isError && error) {
          return toast.error({
            title: 'Update failed',
            description: error.message || 'Something went wrong',
          });
        }
      } catch (error) {
        toast.error({
          title: 'Update failed',
          description: getErrorMessage(error, 'Something went wrong'),
        });
      }
    },
    [updateUserProfile, isError, isSuccess, toast, error]
  );

  return {
    handleSubmit,
    isLoading: isPending,
  };
}

// function _isValidUrl(string: string): boolean {
//   try {
//     new URL(string);
//     return true;
//   } catch {
//     return false;
//   }
// }
