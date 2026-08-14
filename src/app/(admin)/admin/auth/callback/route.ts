import { verifyAccessToken } from '@/lib/auth/token-utils';
import { ROUTES } from '@/lib/constants/routes';
import { serverAdminRefresh } from '@/lib/server-apis';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/admin';

  try {
    const response = await serverAdminRefresh();

    const accessToken = response?.token;
    if (!accessToken) {
      throw new Error('No admin access token');
    }

    verifyAccessToken(accessToken);

    const res = NextResponse.redirect(new URL(next, req.url));

    //  Forward all cookies to browser
    for (const cookie of response.setCookie ?? []) {
      res.headers.append('set-cookie', cookie);
    }

    //  disable caching
    res.headers.set('Cache-Control', 'no-store');

    return res;
  } catch {
    const loginUrl = new URL(ROUTES.admin.auth.login, req.url);
    loginUrl.searchParams.set('next', next);
    loginUrl.searchParams.set('session_expired', 'true');

    return NextResponse.redirect(loginUrl);
  }
}
