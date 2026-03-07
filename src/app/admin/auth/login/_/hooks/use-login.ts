'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLoginSchemaType } from '../schemas';
import { useAdminSelector, useAppDispatch } from '@/states/client';
import { toast } from '@/hooks/use-toast';
import { useCallback, useEffect } from 'react';
import { adminLogin, adminLogout } from '@/states/client/slices/admin-slice';
import { getErrorMessage } from '@/lib/utils';

export const useAdminLogin = () => {
  const { isAuthenticated } = useAdminSelector();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const redirectOnAuthenticated = useCallback(() => {
    const next = searchParams.get('next');
    const redirectPath = next && next.startsWith('/admin') ? next : '/admin';
    router.replace(redirectPath);
    router.refresh();
  }, [router, searchParams]);

  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired');
    if (sessionExpired) {
      dispatch(adminLogout());
      // Remove the query param to allow login attempt
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('session_expired');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (isAuthenticated) {
      redirectOnAuthenticated();
    }
  }, [isAuthenticated, redirectOnAuthenticated, searchParams, dispatch]);

  const handleSubmit = async (credentials: AdminLoginSchemaType) => {
    try {
      const result = await dispatch(adminLogin(credentials)).unwrap();
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      return toast.error({
        title: 'Admin login failed ',
        description: getErrorMessage(error, 'Admin login error'),
      });
    }

    toast.success({ title: 'Admin login successful ' });

    redirectOnAuthenticated();
  };

  return { handleSubmit };
};
