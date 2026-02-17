import { AxiosError } from 'axios';
import { RequestOptions } from './types';

export function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && (error as AxiosError).isAxiosError === true;
}

export function hasErrorMessage(obj: unknown): obj is { error: { message: string } } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as { error?: unknown }).error === 'object' &&
    (obj as { error: { message?: unknown } }).error !== null &&
    'message' in (obj as { error: { message?: unknown } }).error &&
    typeof (obj as { error: { message?: unknown } }).error.message === 'string'
  );
}

export function hasMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as { message?: unknown }).message === 'string'
  );
}

export function normalizeRequestConfig(
  error: AxiosError
): (RequestOptions & { _retry?: boolean; _retryCount?: number }) | null {
  if (!error.config) return null;

  // Create a shallow copy of config without spreading incompatible signal types
  const { signal, ...restConfig } = error.config as RequestOptions;

  return {
    signal,
    ...restConfig,
    headers: {
      ...(error.config.headers || {}),
    },
    _retry: (error.config as { _retry?: boolean })?._retry ?? false,
    _retryCount: (error.config as { _retryCount?: number })?._retryCount ?? 0,
  };
}
