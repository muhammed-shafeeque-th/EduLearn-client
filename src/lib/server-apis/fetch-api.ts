/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiResponse } from '@/types/api-response';
import { config } from '../config';
import { sleep } from '../utils';

export interface FetchOptions extends RequestInit {
  retry?: number;
  retryDelay?: number; // base delay in ms
  token?: string | null;
  authRefresh?: () => Promise<{ token: string } | null>;
  skipAll?: boolean;
}

const DEFAULT_RETRY = 3;
const DEFAULT_RETRY_DELAY = 500;

function getExponentialBackoffDelay(
  attempt: number,
  baseDelay = DEFAULT_RETRY_DELAY,
  maxDelay = 10_000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  const jitter = Math.random() * 0.3 * delay; // 0–30% jitter
  return delay + jitter;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retry = DEFAULT_RETRY,
    retryDelay = DEFAULT_RETRY_DELAY,
    token,
    authRefresh,
    skipAll,
    ...rest
  } = options;

  let attempt = 0;
  let lastError: any;
  let localToken = token || '';

  while (attempt <= retry) {
    try {
      const response = await fetch(`${config.apiUrl}/${endpoint}`, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${localToken}` } : {}),
          ...rest.headers,
        },
        credentials: 'include',
      });

      // Direct return if skipAll is true
      if (skipAll) return response as unknown as ApiResponse<T>;

      if (response.status === 401 && authRefresh) {
        // Resolve the refresh handler: use custom handler if passed, or dynamically load serverRefresh
        let refreshFn = authRefresh;

        if (!refreshFn) {
          // Dynamic import guarantees 'cookies()' module isn't loaded during static analysis
          const { serverRefresh } = await import('@/lib/server-apis/server-apis');
          refreshFn = serverRefresh;
        }

        const refreshed = await refreshFn();
        if (refreshed?.token) {
          localToken = refreshed.token;
          continue;
        }
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status >= 500 && attempt < retry) {
        attempt++;
        const delay = getExponentialBackoffDelay(attempt, retryDelay);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const result = (await response.json()) as ApiResponse<T>;

      return result;
    } catch (err: any) {
      lastError = err;

      // Retry network errors (no response)
      if (
        attempt < retry &&
        (err.name === 'FetchError' || err.message.includes('Failed to fetch'))
      ) {
        attempt++;
        const delay = getExponentialBackoffDelay(attempt, retryDelay);
        await sleep(delay);
        continue;
      }

      break; // Stop retrying for other errors
    }
  }

  throw lastError;
}
