import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';
import { adminAuthToken, authCookieToken } from '@/lib/constants';

const ROUTES = {
  AUTH_ONLY: ['/auth'],
  ADMIN: ['/admin'],
  INSTRUCTOR: ['/instructor'],
  PROTECTED: ['/profile', '/wishlist', '/cart', '/checkout'],
};

function hasRefreshLock(req: NextRequest) {
  return Boolean(req.cookies.get('__refreshing')?.value);
}

function hasCookie(req: NextRequest, name: string): boolean {
  return Boolean(req.cookies.get(name)?.value);
}

function isRoute(pathname: string, patterns: string[]) {
  return patterns.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //  Always allow refresh endpoints
  if (pathname === '/admin/auth/refresh' || pathname === '/auth/refresh') {
    return NextResponse.next();
  }

  const hasUserToken = hasCookie(req, authCookieToken);
  const hasAdminToken = hasCookie(req, adminAuthToken);

  // Prevent logged-in users from visiting /auth
  if (isRoute(pathname, ROUTES.AUTH_ONLY) && hasUserToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Admin routes
  if (isRoute(pathname, ROUTES.ADMIN) && pathname !== '/admin/auth/login') {
    if (!hasAdminToken) {
      const refresh = new URL('/admin/auth/refresh', req.url);
      refresh.searchParams.set('next', pathname);
      return NextResponse.redirect(refresh);
    }
  }

  // Instructor routes
  if (isRoute(pathname, ROUTES.INSTRUCTOR)) {
    if (!hasUserToken) {
      //  if refresh already attempted recently -> send to login
      if (hasRefreshLock(req)) {
        const login = new URL('/auth/login', req.url);
        login.searchParams.set('next', pathname);
        return NextResponse.redirect(login);
      }
      const refresh = new URL('/auth/refresh', req.url);
      refresh.searchParams.set('next', pathname);
      const res = NextResponse.redirect(refresh);

      // set refresh lock for 5 sec
      res.cookies.set('__refreshing', '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 5,
      });

      return res;
    }
  }

  // Authenticated user routes
  if (isRoute(pathname, ROUTES.PROTECTED)) {
    if (!hasUserToken) {
      const refresh = new URL('/auth/refresh', req.url);
      refresh.searchParams.set('next', pathname);
      return NextResponse.redirect(refresh);
    }
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    '/auth/:path*',
    '/admin',
    '/admin/:path((?!auth/login|auth/refresh$).*)',
    '/instructor/:path*',
    '/profile/:path*',
    '/wishlist/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
};
