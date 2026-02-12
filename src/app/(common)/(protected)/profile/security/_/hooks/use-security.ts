'use client';

import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { PasswordChangeType } from '../schema';
import { toast } from '@/hooks/use-toast';
import { UseFormReset } from 'react-hook-form';
import { getErrorMessage } from '@/lib/utils';

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export function useSecurityForm(reset: UseFormReset<PasswordChangeType>) {
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = useCallback((type: keyof ShowPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleSubmit = useCallback(
    async (data: PasswordChangeType) => {
      try {
        const result = await authService.changePassword(data);
        if (!result?.success) {
          throw new Error(result.message);
        }
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });

        toast.success({ title: 'Password updated', description: result.message });
        reset();
      } catch (error) {
        toast.error({
          title: 'Failed to update password',
          description: getErrorMessage(error),
        });
      } finally {
      }
    },
    [reset]
  );

  return {
    showPasswords,
    togglePasswordVisibility,
    handleSubmit,
  };
}
