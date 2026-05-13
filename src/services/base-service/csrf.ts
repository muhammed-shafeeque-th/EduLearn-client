// ---------------------------------------------------------------------------
// CSRF Token Manager (module-level singleton)
// Implements a single-flight fetch so the token is retrieved only once per
// page session, then injected automatically on every mutating request.
// ---------------------------------------------------------------------------
import { CSRF_COOKIE } from '@/lib/constants';
import { getDocument } from '@/lib/utils';
import { apiClient } from '@/lib/utils/api-client';

export const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

let _csrfToken: string | null = null;
let _csrfFetchPromise: Promise<string | null> | null = null;

export function extractCsrfFromCookieString(cookieString: string): string | null {
  if (!cookieString) return null;
  const escapedName = CSRF_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
  return match?.[1] ?? null;
}

function readCsrfFromCookie(): string | null {
  const doc = getDocument();
  if (!doc) return null;

  return extractCsrfFromCookieString(doc.cookie);
}

async function fetchCsrfToken(cookieString?: string): Promise<string | null> {
  const isBrowser = !!getDocument();

  // Check provided cookie string (server-side) or browser cookie first
  const fromCookie = cookieString
    ? extractCsrfFromCookieString(cookieString)
    : readCsrfFromCookie();

  if (fromCookie) {
    if (isBrowser) _csrfToken = fromCookie;
    return fromCookie;
  }

  // Single-flight caching (Browser only)
  if (isBrowser && _csrfFetchPromise) return _csrfFetchPromise;

  const promise = apiClient
    .get<{ csrfToken: string }>(`/auth/csrf-token`, {
      withCredentials: true,
    })
    .then((res) => {
      const token = res.data?.csrfToken ?? null;
      if (isBrowser) _csrfToken = token;
      return token;
    })
    .catch(() => null)
    .finally(() => {
      if (isBrowser) _csrfFetchPromise = null;
    });

  if (isBrowser) _csrfFetchPromise = promise;

  return promise;
}

/**
 * Clears the cached CSRF token (call after logout or on CSRF_TOKEN_INVALID).
 * Exported so the auth-slice can clear the token on logout.
 */
function clearCsrfToken(): void {
  _csrfToken = null;
  _csrfFetchPromise = null;
}

/**
 * Pre-warms the CSRF token. Call this once on app start (e.g., in restoreCredentials).
 * Exported so the auth-slice can eagerly fetch the token before any mutations occur.
 */
export { fetchCsrfToken, clearCsrfToken, _csrfToken };
