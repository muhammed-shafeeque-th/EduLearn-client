import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAuthIsAuthenticated, useAuthSelector } from '@/store';
import { clearError as clearAuthError, login } from '@/store/slices/auth-slice';
import { SigninFormData } from '../schemas';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginCredentials } from '@/types/auth';
import { AuthType } from '@/types/auth';
import { getErrorMessage } from '@/lib/utils';

export const useLogin = () => {
  const { common, toast } = useToast();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error, isLoading } = useAuthSelector();
  const isAuthenticated = useAuthIsAuthenticated();

  // Redirect the user after authentication succeeds
  const redirectOnAuthenticated = useCallback(() => {
    const next = searchParams.get('next');
    // only allow internal redirects for security reasons
    const redirectPath = next && next.startsWith('/') ? next : '/';
    router.replace(redirectPath);
  }, [router, searchParams]);

  // On successful authentication, redirect
  useEffect(() => {
    if (isAuthenticated) {
      redirectOnAuthenticated();
    }
  }, [isAuthenticated, redirectOnAuthenticated]);

  // Handle form submission for login
  const onSubmit = useCallback(
    async (credentials: SigninFormData) => {
      const loginCredentials: LoginCredentials = {
        ...credentials,
        authType: AuthType.EMAIL,
      };

      try {
        await dispatch(login(loginCredentials)).unwrap();
        // The unwrap() call will throw if rejected
        common.loginSuccess();
        redirectOnAuthenticated();
      } catch (error) {
        const message = getErrorMessage(
          error,
          'Please check your email and password and try again.'
        );

        toast.error({ title: 'Login failed', description: message });
        common.loginError(message);
      }
    },
    [dispatch, common, toast, redirectOnAuthenticated]
  );

  // Clear authentication error
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return { error, isAuthenticated, isLoading, onSubmit, clearError };
};
