import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse } from 'axios';

import { config } from '@/lib/config';
import { v4 as uuidv4 } from 'uuid';

import { BaseServiceHooks, BaseServiceOptions, RequestOptions } from './types';

import {
  hasErrorMessage,
  hasMessage,
  hasErrorCode,
  isAxiosError,
  normalizeRequestConfig,
  isApiErrorResponse,
} from './guards';

import { ERROR_CODES, ErrorCode } from '@/lib/errors/error-codes';

import { AppError, ErrorDetail } from '@/lib/errors/app-error';

import { getWindow } from '@/lib/utils';

import { toast } from 'sonner';

import { clearCsrfToken, fetchCsrfToken, readCsrfFromCookie, MUTATION_METHODS } from './csrf';

import { CSRF_HEADER } from '@/lib/constants';

import { AuthCustomEvents } from '@/lib/constants/auth-events';

export abstract class BaseService {
  protected readonly client: AxiosInstance;
  protected readonly baseURL: string;

  protected readonly getToken?: () => string | null | Promise<string | null>;

  protected readonly authRefresh?: () => Promise<{ token: string }> | null;

  protected readonly getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;

  protected readonly hooks?: BaseServiceHooks;

  protected readonly retry: number;

  /**
   * Refresh state
   */
  private isRefreshing = false;

  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor(baseURL: string, options: BaseServiceOptions = {}) {
    this.baseURL = baseURL;

    this.getToken = options.getToken;
    this.authRefresh = options.authRefresh;
    this.getHeaders = options.getHeaders;
    this.hooks = options.hooks;
    this.retry = options.retry ?? 2;

    this.client =
      options.axiosInstance ??
      axios.create({
        baseURL: baseURL || config.apiUrl,

        timeout: 30_000,

        headers: {
          'Content-Type': 'application/json',
        },

        withCredentials: true,
      });

    this._initInterceptors();
  }

  // Interceptors

  private _initInterceptors(): void {
    /**
     * REQUEST INTERCEPTOR
     */
    this.client.interceptors.request.use(
      async (requestConfig) => {
        const headers =
          requestConfig.headers instanceof AxiosHeaders
            ? requestConfig.headers
            : new AxiosHeaders(requestConfig.headers);

        // Dynamic application headers

        if (this.getHeaders) {
          const providedHeaders = await this.getHeaders();

          Object.entries(providedHeaders).forEach(([key, value]) => {
            headers.set(key, value);
          });
        }

        // Authentication

        if (this.getToken) {
          const token = await this.getToken();

          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        }

        // HTTP method

        const method = requestConfig.method?.toLowerCase();

        // CSRF + Idempotency

        if (method && MUTATION_METHODS.has(method)) {
          /**
           * CSRF
           */
          let csrfToken: string | null = null;

          if (getWindow()) {
            csrfToken = readCsrfFromCookie();

            if (!csrfToken) {
              csrfToken = await fetchCsrfToken();
            }
          } else {
            /**
             * Server-side rendering:
             *
             * Axios headers may contain a Cookie header.
             */
            const cookieHeader = headers.get('Cookie');

            csrfToken = await fetchCsrfToken(cookieHeader ? String(cookieHeader) : undefined);
          }

          if (csrfToken) {
            headers.set(CSRF_HEADER, csrfToken);
          }

          /**
           * IDEMPOTENCY
           */
          if (!headers.has('Idempotency-Key')) {
            headers.set('Idempotency-Key', uuidv4());
          }
        }

        // Request correlation

        /**
         * X-Request-ID represents the network attempt.
         *
         * Unlike Idempotency-Key, it may change between retries.
         */
        headers.set('X-Request-ID', uuidv4());

        requestConfig.headers = headers;

        this.hooks?.onRequest?.(requestConfig);

        return requestConfig;
      },

      (error) => {
        this.hooks?.onError?.(error);

        return Promise.reject(error);
      }
    );

    /**
     * RESPONSE INTERCEPTOR
     */
    this.client.interceptors.response.use(
      (response) => {
        this.hooks?.onResponse?.(response);

        return response;
      },

      async (error: AxiosError) => {
        if (!isAxiosError(error)) {
          return Promise.reject(new Error('Unknown network error'));
        }

        const originalRequest = normalizeRequestConfig(error);

        if (!originalRequest) {
          this.hooks?.onError?.(error);

          return Promise.reject(this._handleError(error));
        }

        // 401 - Access token refresh

        if (error.response?.status === 401 && !originalRequest._retry && this.authRefresh) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers = {
                    ...originalRequest.headers,

                    Authorization: `Bearer ${token}`,
                  };

                  resolve(this.client(originalRequest));
                },

                reject,
              });
            });
          }

          originalRequest._retry = true;

          try {
            this.isRefreshing = true;

            const refreshResult = await this.authRefresh();

            this.isRefreshing = false;

            if (!refreshResult?.token) {
              throw new Error('Refresh token missing');
            }

            const token = refreshResult.token;

            /**
             * Resolve all queued requests
             * using the SAME refreshed token.
             */
            await this._processFailedQueueOnSuccess(token);

            originalRequest.headers = {
              ...originalRequest.headers,

              Authorization: `Bearer ${token}`,
            };

            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;

            await this._processFailedQueueOnFailure(refreshError);

            return Promise.reject(this._handleError(refreshError as AxiosError));
          }
        }

        // CSRF invalid

        const responseData = error.response?.data as
          | {
              error?: {
                code?: string;
                errorCode?: string;
              };
            }
          | undefined;

        const csrfErrorCode = responseData?.error?.code ?? responseData?.error?.errorCode;

        if (
          error.response?.status === 403 &&
          csrfErrorCode === 'CSRF_TOKEN_INVALID' &&
          !originalRequest._csrfRetry
        ) {
          originalRequest._csrfRetry = true;

          /**
           * Clear any in-flight state.
           */
          clearCsrfToken();

          /**
           * Read the CURRENT browser cookie first.
           *
           * If the server has rotated the cookie, fetchCsrfToken()
           * will request the endpoint and receive the new token.
           */
          let freshToken = readCsrfFromCookie();

          if (!freshToken) {
            freshToken = await fetchCsrfToken();
          }

          if (freshToken) {
            originalRequest.headers = {
              ...originalRequest.headers,

              [CSRF_HEADER]: freshToken,
            };
          }

          /**
           *
           * The existing Idempotency-Key is preserved.
           *
           */
          return this.client(originalRequest);
        }

        // Generic retry

        const maxRetry = originalRequest.retry ?? this.retry;

        if (
          originalRequest._retryCount! < maxRetry &&
          (!error.response || error.response.status >= 500)
        ) {
          originalRequest._retryCount! += 1;

          const delay = this._getRetryDelay(originalRequest._retryCount!);

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(this.client(originalRequest));
            }, delay);
          });
        }

        // Final error

        this.hooks?.onError?.(error);

        return Promise.reject(this._handleError(error));
      }
    );
  }

  // Error handling

  private _handleError(error: AxiosError): Error {
    function mapStatusToErrorCode(status: number): ErrorCode {
      switch (status) {
        case 400:
          return ERROR_CODES.BAD_REQUEST;

        case 401:
          return ERROR_CODES.UNAUTHORIZED_ACCESS;

        case 403:
          return ERROR_CODES.FORBIDDEN;

        case 404:
          return ERROR_CODES.NOT_FOUND;

        case 429:
          return ERROR_CODES.TOO_MANY_REQUESTS;

        case 500:
          return ERROR_CODES.UNEXPECTED_SERVER_ERROR;

        default:
          return ERROR_CODES.UNKNOWN_ERROR;
      }
    }

    let errorCode: ErrorCode | undefined;

    let errorDetails: ErrorDetail[] | undefined;

    let message = error.message || 'Server error occurred';

    let statusCode: number | undefined;

    // HTTP response

    if (error.response) {
      const { status, data } = error.response;

      statusCode = status;

      if (isApiErrorResponse(data)) {
        errorCode = data.error.code as ErrorCode;

        errorDetails = data.error.details;

        message = data.error.message;
      } else if (hasErrorMessage(data)) {
        message = data.error.message;
      } else if (hasMessage(data)) {
        message = data.message;
      }

      errorCode ??= hasErrorCode(data)
        ? (data.error.code as ErrorCode)
        : mapStatusToErrorCode(statusCode);

      switch (statusCode) {
        case 400:
          message = message || 'Invalid request data.';
          break;

        case 401:
          message = message || 'Authentication required. Please login again.';
          break;

        case 403:
          message = message || 'You do not have permission to perform this action.';
          break;

        case 404:
          message = message || 'Resource not found.';
          break;

        case 429:
          message = message || 'Too many requests. Please try again later.';
          break;

        case 500:
          message = message || 'Server error. Please try again later.';
          break;

        default:
          break;
      }
    }

    // Network error
    else if (error.request) {
      errorCode ??= ERROR_CODES.NETWORK_ERROR;

      message = 'No response received from server. Please check your connection.';
    }

    // Axios configuration / client error
    else {
      errorCode ??= ERROR_CODES.UNEXPECTED_SERVER_ERROR;

      message = error.message || 'An unexpected error occurred.';
    }

    // Client-side notifications

    if (getWindow()) {
      const isSilent =
        (error.config as unknown as Record<string, unknown> | undefined)?.silent === true;

      const responseError = error.response?.data as
        | {
            error?: {
              code?: string;
              errorCode?: string;
            };
          }
        | undefined;

      const serverErrorCode = responseError?.error?.code ?? responseError?.error?.errorCode;

      const isCsrfError =
        typeof serverErrorCode === 'string' && serverErrorCode.startsWith('CSRF_TOKEN');

      if (!isSilent) {
        // Account blocked

        if (errorCode === ERROR_CODES.ACCOUNT_BLOCKED) {
          toast.error('Your account has been blocked. Please contact support for assistance.');

          getWindow()?.dispatchEvent(
            new CustomEvent(AuthCustomEvents.ForceLogout, {
              detail: {
                message: 'Account Blocked',
              },
            })
          );
        }

        // Instructor access denied
        else if (errorCode === ERROR_CODES.INSTRUCTOR_ACCESS_DENIED) {
          toast.error(
            'Your instructor access has been blocked. Please contact admin if you think this is a mistake.'
          );

          getWindow()?.dispatchEvent(new CustomEvent(AuthCustomEvents.SyncSession));
        }

        // Generic forbidden
        else if (statusCode === 403 && !isCsrfError) {
          toast.error('Access denied. You do not have permission for this action.');
        }
      }
    }

    return new AppError(message, errorCode, errorDetails, statusCode ?? 500);
  }

  // Optional logging

  private _logAxiosError(error: unknown): void {
    if (!axios.isAxiosError(error)) {
      console.error('[BaseService] Non-Axios error:', error);

      return;
    }

    console.error('[BaseService] AxiosError:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      responseData: error.response?.data,
    });
  }

  // HTTP methods

  protected async get<T>(
    url: string,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, {
      ...requestConfig,
      signal,
    });

    return response.data;
  }

  protected async post<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const headers = isFormData
      ? {
          'Content-Type': 'multipart/form-data',
        }
      : {};

    const response: AxiosResponse<T> = await this.client.post(url, data, {
      ...requestConfig,

      headers: {
        ...headers,
        ...(requestConfig.headers || {}),
      },

      signal,
    });

    return response.data;
  }

  protected async patch<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, {
      ...requestConfig,
      signal,
    });

    return response.data;
  }

  protected async put<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, {
      ...requestConfig,
      signal,
    });

    return response.data;
  }

  protected async delete<T>(
    url: string,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, {
      ...requestConfig,
      signal,
    });

    return response.data;
  }

  protected async download(
    url: string,
    { signal, ...requestConfig }: RequestOptions = {}
  ): Promise<Blob> {
    const response = await this.client.get(url, {
      ...requestConfig,
      responseType: 'blob',
      signal,
    });

    return response.data;
  }

  // Retry

  private _getRetryDelay(retryCount: number, base = 1000, max = 10000): number {
    const delay = Math.min(base * 2 ** (retryCount - 1), max);

    const jitter = Math.random() * 0.3 * delay;

    return delay + jitter;
  }

  // Refresh queue

  private async _processFailedQueueOnSuccess(token: string): Promise<void> {
    const queue = this.failedQueue;

    this.failedQueue = [];

    await Promise.all(queue.map((pending) => pending.resolve(token)));
  }

  private async _processFailedQueueOnFailure(error: unknown): Promise<void> {
    const queue = this.failedQueue;

    this.failedQueue = [];

    await Promise.all(queue.map((pending) => pending.reject(error)));
  }
}
