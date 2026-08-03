import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query';

export const QUERY_STALE_TIME = {
  short: 30 * 1000,
  medium: 5 * 60 * 1000,
  long: 15 * 60 * 1000,
  extraLong: 30 * 60 * 1000,
} as const;

export const QUERY_GC_TIME = {
  short: 5 * 60 * 1000,
  medium: 10 * 60 * 1000,
  long: 30 * 60 * 1000,
  extraLong: 60 * 60 * 1000,
} as const;

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME.medium,
        gcTime: QUERY_GC_TIME.medium,
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
}
