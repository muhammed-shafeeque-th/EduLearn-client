'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { getStore } from '@/states/client/store';
import { restoreCredentials, logout, refreshToken } from '@/states/client/slices/auth-slice';
import { AuthCustomEvents } from '../constants/auth-events';
import { createAppQueryClient } from './query-client-config';

type RootProvidersProps = {
  children: ReactNode;
};

/**
 * Core client providers for the whole app.
 * Keep this lean: React Query (no persistence) + Redux auth state.
 * Real-time features (WebSocket, query persistence) live in RealtimeProviders.
 */
export function RootProviders({ children }: RootProvidersProps) {
  const [queryClient] = useState(createAppQueryClient);

  useEffect(() => {
    getStore()?.dispatch(restoreCredentials());

    const handleForceLogout = () => {
      getStore()?.dispatch(logout());
    };

    const handleAuthSyncSession = () => {
      getStore()?.dispatch(refreshToken());
    };

    window.addEventListener(AuthCustomEvents.ForceLogout, handleForceLogout);
    window.addEventListener(AuthCustomEvents.SyncSession, handleAuthSyncSession);
    return () => {
      window.removeEventListener(AuthCustomEvents.ForceLogout, handleForceLogout);
      window.removeEventListener(AuthCustomEvents.SyncSession, handleAuthSyncSession);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={getStore()!}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </ReduxProvider>
    </QueryClientProvider>
  );
}
