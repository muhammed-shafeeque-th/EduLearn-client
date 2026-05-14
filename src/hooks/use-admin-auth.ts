'use client';

import { useAdminSelector } from '@/states/client';
import { AuthUser } from '@/types/auth';
import { useMemo } from 'react';

/**
 * Hook to get admin authentication state and user info.
 * @returns { isAuthenticated, AuthUser, isAdmin }
 */
export function useAdminAuth(): {
  isAuthenticated: boolean;
  user: Partial<AuthUser>;
  isAdmin: boolean;
} {
  const { isAuthenticated, admin } = useAdminSelector();
  const isAdmin = useMemo(() => !!admin?.roles.includes('admin'), [admin]);
  return { isAuthenticated, user: admin as Partial<AuthUser>, isAdmin };
}
