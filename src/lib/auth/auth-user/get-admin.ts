'use server';

import { getCookieFromServer, serverAdminRefresh } from '@/lib/server-apis';
import { adminAuthToken } from '@/lib/constants';
import { AuthPayload } from './types';
import { verifyAccessToken } from '../token-utils';
import { AuthUser } from '../auth-guard/types';

export async function getAdmin(): Promise<AuthUser | null> {
  /**
   * Read access token from HTTP-only cookie
   * Cookie missing === token expired
   */
  let token = await getCookieFromServer(adminAuthToken);

  /**
   * If token missing -> refresh
   */
  if (!token) {
    const refreshed = await serverAdminRefresh();
    if (!refreshed || !refreshed.token) return null;
    token = refreshed.token;
  }

  /**
   * Verify token (NOT decode)
   */
  try {
    const payload = verifyAccessToken(token as string);

    // Ensure payload is object with required fields
    if (
      typeof payload !== 'object' ||
      !payload ||
      !('userId' in payload) ||
      !('roles' in payload)
    ) {
      return null;
    }

    return {
      id: payload.userId,
      name: payload.username,
      roles: payload.roles ?? [],
      email: payload.email,
      permissions: payload.permissions || [],
    } as AuthPayload;
  } catch {
    /**
     * Token invalid (rotation / tampering) -> try refresh once
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
        !('roles' in payload)
      ) {
        return null;
      }

      return {
        id: payload.userId,
        name: payload.username,
        roles: payload.roles ?? [],
        email: payload.email,
        permissions: payload.permissions ?? [],
      } as AuthPayload;
    } catch {
      return null;
    }
  }
}
