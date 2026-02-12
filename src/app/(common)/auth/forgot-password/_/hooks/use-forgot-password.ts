'use client';

import { ForgotPasswordSchemaType } from '../schemas';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(data.email);

      setIsSubmitted(true);
      toast.success({
        title: 'Reset link sent!',
        description: result.message || 'Check your email for password reset instructions.',

        options: { duration: 5000 },
      });
    } catch (error) {
      toast.error({
        title: 'Failed to send forgot link',
        description: getErrorMessage(error, 'Please try again later or contact support.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading, isSubmitted, setIsLoading, setIsSubmitted };
};
