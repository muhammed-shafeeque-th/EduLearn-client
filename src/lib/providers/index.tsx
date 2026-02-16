/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/states/client';
import {
  persistQueryClient,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { compress, decompress } from 'lz-string';
import { restoreCredentials } from '@/states/client/slices/auth-slice';
import { NotificationProvider } from '@/states/client/providers/notification';

// Auth Plugin Interface
export interface AuthPlugin {
  refreshToken: () => Promise<{ token: string }>;
}

type ProvidersProps = {
  children: ReactNode;
  authPlugin?: AuthPlugin;
};

const STALE_TIME = {
  short: 30 * 1000, // 30 seconds
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
  extraLong: 30 * 60 * 1000, // 30 minutes
} as const;

const GC_TIME = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 10 * 60 * 1000, // 10 minutes
  long: 30 * 60 * 1000, // 30 minutes
  extraLong: 60 * 60 * 1000, // 1 hour
} as const;

export function StateProviders({ children }: ProvidersProps) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache(),
      mutationCache: new MutationCache(),
      defaultOptions: {
        queries: {
          staleTime: STALE_TIME.medium,
          gcTime: GC_TIME.medium,
          refetchOnWindowFocus: false,
          refetchOnReconnect: 'always',
          refetchOnMount: true,
          networkMode: 'online',
        },
        mutations: {
          networkMode: 'online',
        },
      },
    });
  });

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
          console.error('Failed to deserialize cache data:', error);
          return {};
        }
      },
    });
  }, []);

  // Hydrate Redux state from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      store.dispatch(restoreCredentials());
    }
  }, []);

  // Setup query client persistence (client-side only)
  useEffect(() => {
    if (!localStoragePersister) return;

    const persistOptions = {
      queryClient,
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      buster: 'v1',
      dehydrateOptions: {
        shouldDehydrateQuery: (query: any) => {
          const { state, queryKey } = query;

          if (state.status !== 'success') return false;

          // Exclude sensitive and real-time data from persistence
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
  }, [queryClient, localStoragePersister]);

  const isServer = typeof window === 'undefined';

  const Provider = isServer ? QueryClientProvider : PersistQueryClientProvider;

  const providerProps: any = isServer
    ? { client: queryClient }
    : { client: queryClient, persistOptions: { persister: localStoragePersister! } };

  return (
    <Provider {...providerProps}>
      <ReduxProvider store={store}>
        <NotificationProvider>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
          )}
        </NotificationProvider>
      </ReduxProvider>
    </Provider>
  );
}
