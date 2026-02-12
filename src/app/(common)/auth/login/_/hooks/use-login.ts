import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAuthIsAuthenticated, useAuthSelector } from '@/states/client';
import { clearError as clearAuthError, login } from '@/states/client/slices/auth-slice';
import { SigninFormData } from '../schemas';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginCredentials } from '@/types/auth';
import { AuthType } from '@/types/auth';
import { getErrorMessage } from '@/lib/utils';

export const useLogin = () => {
  const { common } = useToast();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error, isLoading } = useAuthSelector();
  const isAuthenticated = useAuthIsAuthenticated();

  const redirectOnAuthenticated = useCallback(() => {
    const next = searchParams.get('next');
    const redirectPath = next && next.startsWith('/') ? next : '/';
    router.replace(redirectPath);
  }, [router, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      redirectOnAuthenticated();
    }
  }, [isAuthenticated, redirectOnAuthenticated]);

  const onSubmit = useCallback(
    async (credentials: SigninFormData) => {
      const loginCredentials: LoginCredentials = {
        ...credentials,
        authType: AuthType.EMAIL,
      };

      try {
        // The unwrap() call will throw if rejected
        await dispatch(login(loginCredentials)).unwrap();
        common.loginSuccess();
        redirectOnAuthenticated();
      } catch (error) {
        const message = getErrorMessage(
          error,
          'Please check your email and password and try again.'
        );

        common.loginError(message);
      }
    },
    [dispatch, common, redirectOnAuthenticated]
  );

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return { error, isAuthenticated, isLoading, onSubmit, clearError };
};
