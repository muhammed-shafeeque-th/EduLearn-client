import { verifyAccessToken } from '@/lib/auth/token-utils';
import { serverAdminRefresh } from '@/lib/server-apis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/admin';

  try {
    /**
     * Call admin refresh API
     */
    const response = await serverAdminRefresh();

    const accessToken = response?.token;
    if (!accessToken) {
      throw new Error('No admin access token');
    }

    /**
     * Verify token
     */
    verifyAccessToken(accessToken);

    /**
     * Redirect back
     */
    return NextResponse.redirect(new URL(next, req.url));
  } catch {
    /**
     * Refresh failed → admin login
     */
    const loginUrl = new URL('/admin/auth/login', req.url);
    loginUrl.searchParams.set('next', next);

    return NextResponse.redirect(loginUrl);
  }
}
