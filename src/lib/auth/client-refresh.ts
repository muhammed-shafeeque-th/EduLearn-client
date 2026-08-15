/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { AuthResponse } from '@/types/auth';

import { ApiResponse } from '@/types/api-response';
import { logout as logoutAction } from '@/states/client/slices/auth-slice';
import { apiClient } from '../utils/api-client';
import { getDocument, getWindow } from '../utils';
import { ERROR_CODES } from '../errors/error-codes';
import { AxiosError } from 'axios';
import { getStore } from '@/states/client';
import { ROUTES } from '../constants/routes';

// ---------------------------------------------------------------------------
// CSRF helper — reads the CSRF token from the __Host-csrf cookie.
// The BaseService already manages the token cache, but these refresh calls
// use the bare apiClient (not a BaseService instance), so we read the cookie
// directly. fetchCsrfToken() from BaseService sets the cookie, so this works
// as long as initCsrf was dispatched on startup.
// ---------------------------------------------------------------------------
function getCsrfHeader(): Record<string, string> {
  const $document = getDocument();
  if (!$document) return {};
  const match = $document.cookie.match(/(?:^|;\s*)__Host-csrf=([^;]+)/);
  const token = match?.[1];
  return token ? { 'X-CSRF-Token': token } : {};
}

export const clientRefreshApi = async () => {
  const maxRetries = 3;
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      // /api/v1/auth/refresh is exempt from CSRF — no header needed here.
      // We still attach it as a best-practice defensive header.
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        ROUTES.auth.callback,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...getCsrfHeader(),
          },
          withCredentials: true,
        }
      );
      return response;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        const respErrorCode = (error?.response?.data as any)?.error?.code;
        // Logout, attach error_code to URL
        if (getWindow()) {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('error_code', respErrorCode || ERROR_CODES.ACCOUNT_BLOCKED);
            window.history.replaceState({}, '', url.toString());
          } catch {}
        }
        getStore()?.dispatch(logoutAction());
      }
      lastError = error;
      attempt++;
      if (attempt < maxRetries && status >= 500) {
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
      // /admin/auth/callback is NOT exempt from CSRF — must send the token header.
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        ROUTES.admin.auth.callback,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...getCsrfHeader(),
          },
          withCredentials: true,
        }
      );
      return response;
    } catch (err) {
      const error = err as AxiosError;
      const status = error?.response?.status;
      lastError = error;
      attempt++;
      if (attempt < maxRetries && status && status >= 500) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise((res) => setTimeout(res, 100 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
};
