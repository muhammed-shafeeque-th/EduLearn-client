import { config } from '@/lib/config';
import { v4 as uuidv4 } from 'uuid';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  // AxiosRequestHeaders,
  AxiosHeaders,
} from 'axios';
import { BaseServiceHooks, BaseServiceOptions, RequestOptions } from './types';
import {
  hasErrorMessage,
  hasMessage,
  hasErrorWithDetails,
  isAxiosError,
  normalizeRequestConfig,
} from './guards';
import { ERROR_CODES, ErrorCode } from '@/lib/errors/error-codes';
import { AppError, ErrorDetail } from '@/lib/errors/app-error';
import { getWindow } from '@/lib/utils';
import { toast } from 'sonner';

export abstract class BaseService {
  protected readonly client: AxiosInstance;
  protected readonly baseURL: string;
  protected readonly getToken?: () => string | null | Promise<string | null>;
  protected readonly authRefresh?: () => Promise<{ token: string }> | null;
  protected readonly getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  protected readonly hooks?: BaseServiceHooks;
  protected readonly retry: number;

  /** Private State */
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
    this.retry = options.retry ?? 3;

    this.client =
      options.axiosInstance ||
      axios.create({
        baseURL: baseURL || config.apiUrl,
        timeout: 30_000,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

    this._initInterceptors();
  }

  private _initInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        const headers =
          config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers);

        if (this.getToken) {
          const token = await this.getToken();
          if (token) headers.set('Authorization', `Bearer ${token}`);
        }

        const method = config.method?.toLowerCase();
        if (['post', 'patch'].includes(method || '')) {
          if (!headers.has('Idempotency-Key')) {
            headers.set('Idempotency-Key', uuidv4());
          }
        }

        headers.set('X-Request-ID', uuidv4());

        if (this.getHeaders) {
          const providedHeaders = await this.getHeaders();
          Object.entries(providedHeaders).forEach(([k, v]) => headers.set(k, v));
        }

        this.hooks?.onRequest?.(config);

        return config;
      },
      (error) => {
        this.hooks?.onError?.(error);
        return Promise.reject(error);
      }
    );

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
            const { token } = await this.authRefresh()!;
            this.isRefreshing = false;

            if (!token) throw new Error('Refresh token missing');

            await this._processFailedQueueOnSuccess(token);

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };

            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this._processFailedQueueOnFailure(refreshError as Error);

            return Promise.reject(this._handleError(refreshError as AxiosError));
          }
        }

        const maxRetry = originalRequest.retry ?? this.retry;

        if (
          originalRequest._retryCount! < maxRetry &&
          (!error.response || error.response.status >= 500)
        ) {
          originalRequest._retryCount! += 1;

          const delay = this._getRetryDelay(originalRequest._retryCount!);
          return new Promise((resolve) =>
            setTimeout(() => resolve(this.client(originalRequest)), delay)
          );
        }

        this.hooks?.onError?.(error);
        return Promise.reject(this._handleError(error));
      }
    );
  }

  /**
   * Error Handling
   */
  private _handleError(error: AxiosError): Error {
    function mapStatusToErrorCode(status: number) {
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
    let message: string = error.message || 'Server error occurred';
    // this._logAxiosError(error);
    let statusCode: number | undefined;

    if (error.response) {
      const { status } = error.response;
      statusCode = status;
      const data = error.response.data;
      // const details = data?.error?.details;

      // if (
      //   data &&
      //   typeof data === 'object' &&
      //   data !== null &&
      //   'error_code' in data &&
      //   typeof data.error_code === 'string'
      // ) {
      //   errorCode = data.error_code;
      // } else if (
      //   data &&
      //   typeof data === 'object' &&
      //   data.error &&
      //   typeof data.error === 'object' &&
      //   data.error.code
      // ) {
      //   errorCode = data.error.code;
      // } else {
      // Map standard HTTP status to error_code if backend did not provide
      // }
      // Message priority: backend -> fallback

      errorCode = mapStatusToErrorCode(statusCode);

      if (hasErrorWithDetails(data)) {
        errorDetails = data.error.details;
        message = data.error.message;
      } else if (hasErrorMessage(data)) {
        message = data.error.message;
      } else if (hasMessage(data)) {
        message = data.message;
      }

      switch (statusCode) {
        case 400:
          message = message || 'Invalid request data';
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
    } else if (error.request) {
      errorCode ??= ERROR_CODES.NETWORK_ERROR;
      message = 'No response received from server. Please check your connection.';
    } else {
      errorCode ??= ERROR_CODES.UNEXPECTED_SERVER_ERROR;
      message = error.message || 'An unexpected error occurred.';
    }

    // Attach error_code to Error object
    // const err = new Error(message);
    // if (errorCode) {
    //   Object.defineProperty(err, 'error_code', {
    //     value: errorCode,
    //     enumerable: true,
    //     configurable: true,
    //     writable: true,
    //   });

    //   // Update the current route's error_code param in browser environment
    if (getWindow()) {
      // try {
      //   const url = new URL(getWindow()?.location.href || '');
      //   url.searchParams.set('error_code', errorCode ?? '');
      //   window.history.replaceState({}, '', url.toString());
      // } catch {
      //   // Silently ignore if URL cannot be updated
      // }

      const isSilent = (error.config as unknown as Record<string, unknown>)?.silent === true;
      if (!isSilent) {
        if (statusCode === 403) {
          toast.error(
            'Your account has been blocked. Please contact support for assistance.'
            // 'Session expired or access denied. Please log in again.'
          );
          getWindow()?.dispatchEvent(
            new CustomEvent('auth:force-logout', { detail: { message: 'Access Denied' } })
          );
        }
        //   else if (statusCode === 401) {
        //     getWindow()?.dispatchEvent(
        //       new CustomEvent('auth:force-logout', { detail: { message: 'Session Expired' } })
        //     );
        //   } else if (statusCode !== 404 && statusCode !== undefined && statusCode < 500) {
        //     // generic client level errors, like 400 validation not silent
        //     toast.error(message || 'An error occurred.');
        //   } else if (statusCode === undefined || statusCode >= 500) {
        //     toast.error(message || 'A network or server error occurred.');
        //   }
      }
    }
    // }
    return new AppError(message, errorCode, errorDetails, statusCode ?? 500);
  }

  private _logAxiosError(error: unknown) {
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

  protected async get<T>(url: string, { signal, ...config }: RequestOptions = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, { ...config, signal });
    return response.data;
  }

  protected async post<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...config }: RequestOptions = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response: AxiosResponse<T> = await this.client.post(url, data, {
      ...config,
      headers: { ...headers, ...(config?.headers || {}) },
      signal,
    });
    return response.data;
  }

  protected async patch<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...config }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, { ...config, signal });
    return response.data;
  }

  protected async put<T, D = unknown>(
    url: string,
    data?: D,
    { signal, ...config }: RequestOptions = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, { ...config, signal });
    return response.data;
  }

  protected async delete<T>(url: string, { signal, ...config }: RequestOptions = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, { ...config, signal });
    return response.data;
  }

  protected async download(url: string, { signal, ...config }: RequestOptions = {}): Promise<Blob> {
    const response = await this.client.get(url, { ...config, responseType: 'blob', signal });
    return response.data;
  }

  /**
   * Exponential backoff with jitter
   * - retry #1 → ~500ms
   * - retry #2 → ~1000ms
   * - retry #3 → ~2000ms
   */
  private _getRetryDelay(retryCount: number, base = 1000, max = 10000): number {
    const delay = Math.min(base * 2 ** (retryCount - 1), max);
    const jitter = Math.random() * 0.3 * delay;
    return delay + jitter;
  }

  private async _processFailedQueueOnSuccess(token: string) {
    await Promise.all(this.failedQueue.map((p) => p.resolve(token)));
    this.failedQueue = [];
  }
  private async _processFailedQueueOnFailure(error: Error) {
    await Promise.all(this.failedQueue.map((p) => p.reject(error)));
    this.failedQueue = [];
  }
}
