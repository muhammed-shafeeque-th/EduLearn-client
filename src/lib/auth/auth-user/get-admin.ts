'use server';

import { getCookieFromServer, serverAdminRefresh } from '@/lib/server-apis';
import { adminAuthToken } from '@/lib/constants';
import { AuthPayload } from './types';
import { verifyAccessToken } from '../token-utils';

export async function getAdmin(): Promise<AuthPayload | null> {
  /**
   * STEP 1: Read access token from HTTP-only cookie
   * Cookie missing === token expired
   */
  let token = await getCookieFromServer(adminAuthToken);

  /**
   * STEP 2: If token missing → refresh
   */
  if (!token) {
    const refreshed = await serverAdminRefresh();
    if (!refreshed || !refreshed.token) return null;
    token = refreshed.token;
  }

  /**
   * STEP 3: Verify token (NOT decode)
   */
  try {
    const payload = verifyAccessToken(token as string);

    // Ensure payload is object with required fields
    if (typeof payload !== 'object' || !payload || !('userId' in payload) || !('role' in payload)) {
      return null;
    }

    return {
      id: payload.userId,
      name: payload.username,
      role: payload.role,
      email: payload.email,
    } as AuthPayload;
  } catch {
    /**
     * Token invalid (rotation / tampering) → try refresh once
     */
    const refreshed = await serverAdminRefresh();
    if (!refreshed || !refreshed.token) return null;
    token = refreshed.token;

    try {
      const payload = verifyAccessToken(token as string);
      if (
        typeof payload !== 'object' ||
        !payload ||
        !('userId' in payload) ||
        !('role' in payload)
      ) {
        return null;
      }

      return {
        id: payload.userId,
        name: payload.username,
        role: payload.role,
        email: payload.email,
      } as AuthPayload;
    } catch {
      return null;
    }
  }
}
