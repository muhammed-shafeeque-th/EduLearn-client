'use client';

import { useAppSelector, useAuthIsAuthenticated } from '@/states/client';
import { useMemo } from 'react';
import { AuthUser } from '@/types/auth';
import { selectUser } from '@/states/client/selectors/auth.selectors';

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
  const isInstructor = useMemo(() => !!user?.roles.includes('instructor'), [user]);
  return { isAuthenticated, user, isInstructor };
}
