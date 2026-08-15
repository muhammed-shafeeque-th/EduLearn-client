'use server';

import { cookies } from 'next/headers';
import { adminAuthToken, authCookieToken } from '../constants';
import { apiClient } from '../utils/api-client';
import { ApiResponse } from '@/types/api-response';
import { AuthResponse } from '@/types/auth';
import { sleep } from '../utils';
import { ROUTES } from '../constants/routes';

export async function getCookieFromServer(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieItem = cookieStore.get(name);
  return cookieItem?.value;
}

export const getServerCookieHeaders = async () => {
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  return {
    Cookie: cookieHeader,
  };
};

export async function createServerApiClient() {
  const cookieHeader = await getServerCookieHeaders();

  return apiClient.create({
    headers: cookieHeader,
    withCredentials: true,
  });
}

export const serverRefreshApi = async () => {
  const cookieHeader = await getServerCookieHeaders();

  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        ROUTES.auth.callback,
        {},
        {
          headers: {
            ...(cookieHeader || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      );
      return response;
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await sleep(100 * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
};
export const serverAdminRefreshApi = async () => {
  const cookieHeader = await getServerCookieHeaders();

  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        ROUTES.admin.auth.callback,
        {},
        {
          headers: {
            ...(cookieHeader || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      );
      return response;
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await sleep(100 * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
};

export const getServerAuthToken = async () => {
  const authToken = await getCookieFromServer(authCookieToken);

  return authToken ?? null;
};
export const getServerAdminToken = async () => {
  const authToken = await getCookieFromServer(adminAuthToken);

  return authToken ?? null;
};
