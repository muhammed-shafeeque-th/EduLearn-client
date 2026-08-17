import { CSRF_COOKIE } from '@/lib/constants';
import { getDocument } from '@/lib/utils';
import { apiClient } from '@/lib/utils/api-client';

export const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

let _csrfFetchPromise: Promise<string | null> | null = null;

/**
 * Extract a cookie value from a Cookie header / document.cookie string.
 */
export function extractCsrfFromCookieString(cookieString: string): string | null {
  if (!cookieString) {
    return null;
  }

  const escapedName = CSRF_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));

  return match?.[1] ?? null;
}

/**
 * Read the CSRF token directly from document.cookie.
 *
 * This is intentionally the browser source of truth.
 */
export function readCsrfFromCookie(): string | null {
  const document = getDocument();

  if (!document) {
    return null;
  }

  return extractCsrfFromCookieString(document.cookie);
}

/**
 * Fetch CSRF token from the API.
 *
 * Browser:
 * - First checks document.cookie.
 * - If unavailable, fetches /auth/csrf-token.
 * - Uses single-flight protection so multiple simultaneous
 *   requests do not create multiple CSRF requests.
 *
 * Server:
 * - Accepts an optional Cookie header.
 */
export async function fetchCsrfToken(cookieString?: string): Promise<string | null> {
  const isBrowser = !!getDocument();

  /**
   * Browser:
   *
   * The cookie is the source of truth.
   */
  const fromCookie = cookieString
    ? extractCsrfFromCookieString(cookieString)
    : readCsrfFromCookie();

  if (fromCookie) {
    return fromCookie;
  }

  /**
   * Browser-only single-flight.
   *
   * If multiple mutations happen simultaneously while the
   * application is starting, only one CSRF request is made.
   */
  if (isBrowser && _csrfFetchPromise) {
    return _csrfFetchPromise;
  }

  const promise = apiClient
    .get<{ csrfToken: string }>('/auth/csrf-token', {
      withCredentials: true,
    })
    .then((response) => {
      return response.data?.csrfToken ?? null;
    })
    .catch(() => {
      return null;
    })
    .finally(() => {
      if (isBrowser) {
        _csrfFetchPromise = null;
      }
    });

  if (isBrowser) {
    _csrfFetchPromise = promise;
  }

  return promise;
}

/**
 * Clear the in-flight CSRF request.
 *
 * We intentionally do NOT keep a long-lived token cache here.
 * document.cookie is the source of truth.
 */
export function clearCsrfToken(): void {
  _csrfFetchPromise = null;
}
