import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  GenericAbortSignal,
  InternalAxiosRequestConfig,
} from 'axios';

export interface RequestOptions extends AxiosRequestConfig {
  signal?: AbortSignal | GenericAbortSignal;
  retry?: number;
  silent?: boolean;
}

export interface BaseServiceHooks {
  onRequest?: (config: InternalAxiosRequestConfig) => void;
  onResponse?: (response: AxiosResponse) => void;
  onError?: (error: AxiosError) => void;
}

export interface BaseServiceOptions {
  /**
   * Function to get the current access token (for Authorization header)
   */
  getToken?: () => string | null | Promise<string | null>;
  /**
   * Optional: Function to refresh token if accessToken expired
   */
  authRefresh?: () => Promise<{ token: string }> | null;
  /**
   * Optional: Provide custom headers (for SSR, cookies, etc.)
   */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /**
   * Optional: Provide a custom Axios instance (for testing/mocking)
   */
  axiosInstance?: AxiosInstance;
  /**
   * Optional: Hooks for logging/tracing
   */
  hooks?: BaseServiceHooks;
  /**
   * Optional: Retry count for failed requests
   */
  retry?: number;
}
