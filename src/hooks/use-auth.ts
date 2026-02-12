'use client';

import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector, useAuthIsAuthenticated } from '@/states/client';
import { logout } from '@/states/client/slices/auth-slice';
import { signOut } from 'next-auth/react';
import { googleLogout } from '@react-oauth/google';

export function useAuth() {
  const { common, toast } = useToast();
  const { isLoading, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = useAuthIsAuthenticated();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    if (!user?.userId) {
      toast.warning({ title: "Can't logout", description: 'userId not found' });
      return;
    }
    const result = await dispatch(logout());
    await signOut();
    googleLogout();

    if (result.meta.requestStatus === 'rejected') {
      toast.error({ title: 'Logout failed', description: result.payload as string });
      return;
    }
    common.logoutSuccess();
  };

  return {
    isLoading,
    user,
    isAuthenticated,
    logout: handleLogout,
  };
}
