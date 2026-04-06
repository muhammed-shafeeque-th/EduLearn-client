'use server';

import { authCookieToken } from '@/lib/constants';
import { getCookieFromServer, serverRefresh } from '@/lib/server-apis';
import { AuthPayload } from './types';
import { verifyAccessToken } from '../token-utils';

export async function getUser(): Promise<AuthPayload | null> {
  let token = await getCookieFromServer(authCookieToken);

  if (!token) {
    const refreshed = await serverRefresh();
    if (!refreshed || !refreshed?.token) return null;
    token = refreshed.token;
  }

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
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      email: payload.email,
    } as AuthPayload;
  } catch {
    const refreshed = await serverRefresh();
    if (!refreshed || !refreshed?.token) return null;

    const payload = verifyAccessToken(refreshed.token as string);
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
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      email: payload.email,
    } as AuthPayload;
  }
}
