/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { ApiResponse } from '@/types/api-response';
import { config } from '../config';
import { serverAdminRefreshApi, serverRefreshApi } from './server-utils';
import { sleep } from '../utils';
import { singleFlight } from './single-flight';

export const serverRefresh = async () =>
  singleFlight('server-user-refresh', async () => {
    const response = await serverRefreshApi();
    if (!response.data?.success) {
      throw new Error(response.data.message);
    }

    let setCookie: string[] = [];
    const headers = response.headers;

    if (typeof headers?.getSetCookie === 'function') {
      setCookie = headers.getSetCookie() ?? [];
    }
    // else if ('set-cookie' in headers) {
    //   // If it's already an array, use directly. If it's a string, wrap to array.
    //   const rawVal = (headers as any)['set-cookie'];
    //   if (Array.isArray(rawVal)) setCookie = rawVal;
    //   else if (typeof rawVal === 'string') setCookie = [rawVal];
    // }

    return { token: response.data?.data?.token, setCookie };

    // return {
    //   token: response.data.data?.token,
    // };
  });

export const serverAdminRefresh = async () =>
  singleFlight('server-admin-refresh', async () => {
    const response = await serverAdminRefreshApi();
    if (!response.data?.success) {
      throw new Error(response.data.message);
    }
    let setCookie: string[] = [];
    const headers = response.headers;

    if (typeof headers?.getSetCookie === 'function') {
      setCookie = headers.getSetCookie() ?? [];
    } else {
      // Axios compatibility: check various casing for set-cookie
      const rawVal =
        (headers as any)['set-cookie'] ||
        (headers as any)['Set-Cookie'] ||
        (headers as any)['set-Cookie'];

      if (Array.isArray(rawVal)) {
        setCookie = rawVal;
      } else if (typeof rawVal === 'string') {
        setCookie = [rawVal];
      }
    }

    return { token: response.data?.data?.token, setCookie };
  });

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
    authRefresh = serverRefresh,
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
        const refreshed = await authRefresh();
        if (refreshed?.token) {
          localToken = refreshed.token;
          continue; // Retry the same request with new token
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
