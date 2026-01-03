'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLoginSchemaType } from '../schemas';
import { useAppDispatch, useAuthIsAuthenticated } from '@/store';
import { toast } from '@/hooks/use-toast';
import { useCallback, useEffect } from 'react';
import { adminLogin } from '@/store/slices/admin-slice';
import { getErrorMessage } from '@/lib/utils';

export const useAdminLogin = () => {
  const isAuthenticated = useAuthIsAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Redirect the user after authentication succeeds
  const redirectOnAuthenticated = useCallback(() => {
    const next = searchParams.get('next');
    // only allow internal redirects for security reasons
    const redirectPath = next && next.startsWith('/admin') ? next : '/admin';
    router.replace(redirectPath);
  }, [router, searchParams]);

  // On successful authentication, redirect
  useEffect(() => {
    if (isAuthenticated) {
      redirectOnAuthenticated();
    }
  }, [isAuthenticated, redirectOnAuthenticated]);

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
