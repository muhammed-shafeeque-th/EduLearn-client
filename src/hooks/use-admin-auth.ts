'use client';

import { useAdminSelector } from '@/states/client';
import { User } from '@/types/user';
import { useMemo } from 'react';

/**
 * Hook to get admin authentication state and user info.
 * @returns { isAuthenticated, user, isAdmin }
 */
export function useAdminAuth(): {
  isAuthenticated: boolean;
  user: Partial<User>;
  isAdmin: boolean;
} {
  const { isAuthenticated, admin } = useAdminSelector();
  const isAdmin = useMemo(() => admin?.role === 'admin', [admin]);
  return { isAuthenticated, user: admin as Partial<User>, isAdmin };
}
