'use client';

import { useAppSelector, useAuthIsAuthenticated } from '@/states/client';
import { useMemo } from 'react';
import { selectUser } from '@/states/client/slices/auth-slice';
import { AuthUser } from '@/types/auth';

/**
 * Hook to get instructor authentication state and user info.
 * @returns { isAuthenticated, user, isInstructor }
 */
export function useInstructorAuth(): {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isInstructor: boolean;
} {
  const isAuthenticated = useAuthIsAuthenticated();
  const user = useAppSelector(selectUser);
  const isInstructor = useMemo(() => user?.role === 'instructor', [user]);
  return { isAuthenticated, user, isInstructor };
}
