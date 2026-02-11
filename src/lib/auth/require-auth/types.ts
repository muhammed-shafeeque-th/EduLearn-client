export type UserRole = 'admin' | 'instructor' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  permissions?: string[];
  // orgId, tenantId, flags, etc.
}

/**
 * Context passed to custom conditions
 * (useful for ownership, tenant checks, etc.)
 */
export interface AuthContext<Params, Resource> {
  params?: Params;
  resource?: Resource;
}

export interface RequireAuthOptions<Params, Resource> {
  /** Redirect if user is NOT authenticated */
  redirectTo?: string;

  /**
   * Controls the behavior when an error or exception is thrown during authentication or authorization checks.
   *
   * - If set to `true`, the user will be redirected to the default error page (e.g., `/403` or `/`).
   * - If set to `false`, exceptions are silently ignored and `null` is returned (no redirect).
   * - If set to a string URL (e.g., `"/my-error-page"`), the user will be redirected to that URL.
   * - If set to `"throw"`, the error will be rethrown and can be handled upstream.
   *
   * @example
   *   // Redirect to default on error
   *   redirectOnException: true
   *
   *   // Custom error page
   *   redirectOnException: "/auth/error"
   *
   *   // Throw the error for custom handling
   *   redirectOnException: "throw"
   *
   *   // Suppress the redirect and just return null
   *   redirectOnException: false
   */
  redirectOnException?: 'throw' | boolean | string;

  /** Redirect if user IS authenticated but NOT authorized */
  forbiddenRedirect?: string;

  /** Allowed roles */
  roles?: UserRole[];

  /** Required permissions */
  permissions?: string[];

  /**
   * Provide a custom getUser callback to fetch the current user.
   * Useful for advanced scenarios like multi-auth, tests, or non-standard flows.
   * If not provided, defaults to the built-in getCurrentUser.
   */
  getUser?: <T extends AuthUser>() => Promise<T | null>;

  /**
   * Custom authorization condition
   * Return true → allow
   * Return false → deny
   */
  condition?: (user: AuthUser, ctx?: AuthContext<Params, Resource>) => boolean | Promise<boolean>;

  /**
   * Custom handler when user is unauthenticated
   * Defaults to redirect()
   */
  onUnauthenticated?: (ctx?: AuthContext<Params, Resource>) => never | void;

  /**
   * Custom handler when user is unauthorized
   */
  onUnauthorized?: (user: AuthUser, ctx?: AuthContext<Params, Resource>) => never | void;

  /**
   * If true → returns null instead of redirecting
   * Useful for optional-auth pages
   */
  returnNullInsteadOfRedirect?: boolean;

  /** Extra context (route params, resource, etc.) */
  context?: AuthContext<Params, Resource>;
}
