'use server';

import { redirect } from 'next/navigation';
import type { RequireAuthOptions, AuthUser } from './types';
import { getCurrentUser } from '../get-current-user';

const DEFAULT_LOGIN_REDIRECT = '/auth/login';
const DEFAULT_FORBIDDEN_REDIRECT = '/403';

export async function requireAuth(options: RequireAuthOptions = {}): Promise<AuthUser | null> {
  const {
    redirectTo = DEFAULT_LOGIN_REDIRECT,
    forbiddenRedirect = DEFAULT_FORBIDDEN_REDIRECT,
    roles,
    getUser = getCurrentUser,
    permissions,
    condition,
    onUnauthenticated,
    onUnauthorized,
    returnNullInsteadOfRedirect = false,
    context,
  } = options;

  const user = await getUser();

  /* -----------------------------
   * Unauthenticated
   * ----------------------------- */
  if (!user) {
    if (onUnauthenticated) {
      onUnauthenticated(context);
      return null;
    }

    if (returnNullInsteadOfRedirect) {
      return null;
    }

    redirect(redirectTo);
  }

  /* -----------------------------
   * Role check
   * ----------------------------- */
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      if (onUnauthorized) {
        onUnauthorized(user, context);
        return null;
      }
      redirect(forbiddenRedirect);
    }
  }

  /* -----------------------------
   * Permission check
   * ----------------------------- */
  if (permissions && permissions.length > 0) {
    // const userPermissions = user.permissions ?? [];
    const userPermissions: string[] = [''];

    const hasPermissions = permissions.every((p) => userPermissions.includes(p));

    if (!hasPermissions) {
      if (onUnauthorized) {
        onUnauthorized(user, context);
        return null;
      }
      redirect(forbiddenRedirect);
    }
  }

  /* -----------------------------
   * Custom condition (ABAC)
   * ----------------------------- */
  if (condition) {
    const allowed = await condition(user, context);

    if (!allowed) {
      if (onUnauthorized) {
        onUnauthorized(user, context);
        return null;
      }
      redirect(forbiddenRedirect);
    }
  }

  /* -----------------------------
   * Authorized
   * ----------------------------- */
  return user;
}
