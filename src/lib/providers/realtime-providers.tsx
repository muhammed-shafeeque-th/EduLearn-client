'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { compress, decompress } from 'lz-string';
import { NotificationProvider } from '@/states/client/providers/notification';
import { useAuthIsAuthenticated } from '@/states/client';

type RealtimeProvidersProps = {
  children: ReactNode;
};

/**
 * Authenticated / real-time layer: offline query cache + notification WebSocket.
 * Mount under layouts that serve logged-in UX (e.g. `(common)` with header).
 */
export function RealtimeProviders({ children }: RealtimeProvidersProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthIsAuthenticated();

  const localStoragePersister = useMemo(() => {
    if (typeof window === 'undefined') return undefined;

    return createSyncStoragePersister({
      key: 'EDULEARN_OFFLINE_CACHE',
      storage: window.localStorage,
      throttleTime: 1000,
      serialize: (data) => {
        try {
          return compress(JSON.stringify(data));
        } catch (error) {
          console.error('Failed to serialize cache data:', error);
          return '';
        }
      },
      deserialize: (data) => {
        try {
          return JSON.parse(decompress(data) || '{}');
        } catch (error) {
          console.error('Failed to deserialize cache da ta:', error);
          return {};
        }
      },
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !localStoragePersister) return;

    const persistOptions = {
      queryClient,
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60 * 1000,
      buster: 'v2',
      dehydrateOptions: {
        shouldDehydrateQuery: (query: any) => {
          const { state, queryKey } = query;

          if (state.status !== 'success') return false;

          const sensitiveKeys = ['session', 'user', 'auth', 'token'];
          const realtimeKeys = ['notification', 'chat', 'live'];
          if (
            sensitiveKeys.some((key) => queryKey.includes(key)) ||
            realtimeKeys.some((key) => queryKey.includes(key))
          ) {
            return false;
          }

          return true;
        },
      },
    };

    const [, persistPromise] = persistQueryClient(persistOptions);
    persistPromise.catch((error) => {
      console.error('Failed to setup query client persistence:', error);
    });
  }, [queryClient, localStoragePersister, isAuthenticated]);

  return <NotificationProvider>{children}</NotificationProvider>;
}
