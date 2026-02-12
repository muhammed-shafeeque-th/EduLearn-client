'use client';

import { useAppDispatch } from '@/states/client';
import { setCredentials } from '@/states/client/slices/auth-slice';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * Syncs NextAuth session with Redux auth state.
 */
export function useAuthSync(): void {
  const { data: userSession, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if ((status === 'authenticated' && userSession?.user) || userSession?.user) {
      const { user } = userSession;
      dispatch(
        setCredentials({
          token: user.token!,
        })
      );
    }
  }, [status, userSession, dispatch]);
}
