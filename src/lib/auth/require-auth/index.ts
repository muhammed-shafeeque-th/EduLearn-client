'use server';

import { redirect } from 'next/navigation';
import type { RequireAuthOptions, AuthUser } from './types';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getUser as getAuthUser } from '../auth-user';

const DEFAULT_LOGIN_REDIRECT = '/auth/login';
const DEFAULT_HOME_REDIRECT = '/';
const DEFAULT_FORBIDDEN_REDIRECT = '/403';

export async function requireAuth<P = Record<string, string>, R = unknown>(
  options: RequireAuthOptions<P, R> = {}
): Promise<AuthUser | null> {
  const {
    redirectTo = DEFAULT_LOGIN_REDIRECT,
    forbiddenRedirect = DEFAULT_FORBIDDEN_REDIRECT,
    roles,
    getUser = getAuthUser,
    permissions,
    condition,
    onUnauthenticated,
    onUnauthorized,
    redirectOnException,
    returnNullInsteadOfRedirect = false,
    context,
  } = options;

  try {
    const user = await getUser();

    // Unauthenticated
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

    // Role check (RBAC: Role-Based Access Control)
    if (roles && roles.length > 0) {
      if (!roles.includes(user.role)) {
        if (onUnauthorized) {
          onUnauthorized(user, context);
          return null;
        }
        redirect(forbiddenRedirect);
      }
    }

    // Permission check (RBAC or Permissions-Based)
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

    // Custom condition (ABAC)
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

    // Authorized
    return user;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    // Log the error for observability and security
    console.error('Error during requireAuth:', error);

    if (redirectOnException) {
      if (typeof redirectOnException === 'string') {
        if (redirectOnException === 'throw') {
          throw error;
        }
        redirect(redirectOnException);
      }
      // If it's true (not string), use default forbidden redirect
      redirect(DEFAULT_HOME_REDIRECT);
    }

    // If redirectOnException is false or not set, you could rethrow or return null (here we fallback to generic redirect)
    // redirect(DEFAULT_FORBIDDEN_REDIRECT);
    return null;
  }

  // Fail-safe return; will not be reached due to redirects above
  return null;
}
