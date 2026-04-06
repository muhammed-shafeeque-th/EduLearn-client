import { AxiosError } from 'axios';
import { RequestOptions } from './types';
import { AppError, ErrorDetail } from '@/lib/errors/app-error';

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
export function hasErrorCode(obj: unknown): obj is { error: { code: string } } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as { error?: unknown }).error === 'object' &&
    (obj as { error: { code?: unknown } }).error !== null &&
    'code' in (obj as { error: { code?: unknown } }).error &&
    typeof (obj as { error: { code: string } }).error.code === 'string'
  );
}
export function isApiErrorResponse(
  obj: unknown
): obj is { error: { details: ErrorDetail[]; message: string; code: string } } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as { error?: unknown }).error === 'object' &&
    (obj as { error: { message?: unknown } }).error !== null &&
    'message' in (obj as { error: { message?: unknown } }).error &&
    typeof (obj as { error: { message?: unknown } }).error.message === 'string' &&
    'code' in (obj as { error: { code?: unknown } }).error &&
    typeof (obj as { error: { code: string } }).error.code === 'string' &&
    'details' in (obj as { error: { details?: unknown } }).error &&
    Array.isArray((obj as { error: { details?: unknown } }).error.details)
    //  && (obj as { error: { details?: unknown } }).error.details.every((detail) => {
    //   return (
    //     typeof detail === 'object' &&
    //     detail !== null &&
    //     'field' in detail &&
    //     typeof (detail as { field?: unknown }).field === 'string' &&
    //     'message' in detail &&
    //     typeof (detail as { message?: unknown }).message === 'string'
    //   );
    // })
  );
}
export function isAppError(obj: unknown): obj is AppError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'errorCode' in obj &&
    typeof (obj as { errorCode?: unknown }).errorCode === 'string' &&
    'message' in obj &&
    typeof (obj as { message?: unknown }).message === 'string' &&
    'details' in obj &&
    Array.isArray((obj as { details?: unknown }).details) &&
    'status' in obj &&
    typeof (obj as { status?: unknown }).status === 'number'
    //  && (obj as { error: { details?: unknown } }).error.details.every((detail) => {
    //   return (
    //     typeof detail === 'object' &&
    //     detail !== null &&
    //     'field' in detail &&
    //     typeof (detail as { field?: unknown }).field === 'string' &&
    //     'message' in detail &&
    //     typeof (detail as { message?: unknown }).message === 'string'
    //   );
    // })
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
): (RequestOptions & { _retry?: boolean; _retryCount?: number; _csrfRetry?: boolean }) | null {
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
    _csrfRetry: (error.config as { _csrfRetry?: boolean })?._csrfRetry ?? false,
  };
}
