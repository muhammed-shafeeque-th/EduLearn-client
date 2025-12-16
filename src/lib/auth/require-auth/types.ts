export type UserRole = 'admin' | 'instructor' | 'student';

export interface AuthUser {
  id: string;
  role: UserRole;
  permissions?: string[];
  // extend later: orgId, tenantId, flags, etc.
}

/**
 * Context passed to custom conditions
 * (useful for ownership, tenant checks, etc.)
 */
export interface AuthContext {
  params?: Record<string, string>;
  resource?: unknown;
}

export interface RequireAuthOptions {
  /** Redirect if user is NOT authenticated */
  redirectTo?: string;

  /** Redirect if user IS authenticated but NOT authorized */
  forbiddenRedirect?: string;

  /** Allowed roles */
  roles?: UserRole[];

  /** Required permissions */
  permissions?: string[];

  /**
   * Optionally provide a custom getUser callback to fetch the current user.
   * Useful for advanced scenarios like multi-auth, tests, or non-standard flows.
   * If not provided, defaults to the built-in getCurrentUser.
   */
  getUser?: <T extends AuthUser>() => Promise<T | null>;

  /**
   * Custom authorization condition
   * Return true → allow
   * Return false → deny
   */
  condition?: (user: AuthUser, ctx?: AuthContext) => boolean | Promise<boolean>;

  /**
   * Custom handler when user is unauthenticated
   * Defaults to redirect()
   */
  onUnauthenticated?: (ctx?: AuthContext) => never | void;

  /**
   * Custom handler when user is unauthorized
   */
  onUnauthorized?: (user: AuthUser, ctx?: AuthContext) => never | void;

  /**
   * If true → returns null instead of redirecting
   * Useful for optional-auth pages
   */
  returnNullInsteadOfRedirect?: boolean;

  /** Extra context (route params, resource, etc.) */
  context?: AuthContext;
}
