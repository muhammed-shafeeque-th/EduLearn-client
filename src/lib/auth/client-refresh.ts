'use client';

import { AuthResponse } from '@/types/auth';

import { ApiResponse } from '@/types/api-response';
import { logout as logoutAction } from '@/states/client/slices/auth-slice';
import { apiClient } from '../utils/api-client';
import { getWindow } from '../utils';
import { ERROR_CODES } from '../errors/error-codes';
import { store } from '@/states/client';

export const clientRefreshApi = async () => {
  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/refresh',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      );
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Check if error is an AxiosError with 403 status
      const status = error?.response?.status;
      if (status === 403) {
        // Logout, attach error_code to URL
        if (getWindow()) {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('error_code', ERROR_CODES.USER_BLOCKED);
            window.history.replaceState({}, '', url.toString());
          } catch {
            // Ignore
          }
        }
        store.dispatch(logoutAction());
      }
      lastError = error;
      attempt++;
      if (attempt < maxRetries && status !== 403) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise((res) => setTimeout(res, 100 * Math.pow(2, attempt - 1)));
      } else {
        break;
      }
    }
  }
  throw lastError;
};
export const adminRefreshApi = async () => {
  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/admin/auth/refresh',
        {},
        {
          headers: {
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
        await new Promise((res) => setTimeout(res, 100 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
};
