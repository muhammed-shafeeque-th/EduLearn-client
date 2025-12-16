'use client';

import { useAppSelector } from '@/store';
import { useMemo } from 'react';
import { selectIsAuthenticated, selectUser } from '@/store/slices/auth-slice';
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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isInstructor = useMemo(() => user?.role === 'instructor', [user]);
  return { isAuthenticated, user, isInstructor };
}
