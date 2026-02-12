import { verifyAccessToken } from '@/lib/auth/token-utils';
import { serverRefresh } from '@/lib/server-apis';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // prevent caching

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/';

  try {
    const response = await serverRefresh();

    const accessToken = response.token;
    if (!accessToken) {
      throw new Error('No access token returned');
    }

    /**
     * Verify newly issued token (server-side safety)
     */
    verifyAccessToken(accessToken);

    /**
     * Redirect back to original destination
     */
    const res = NextResponse.redirect(new URL(next, req.url), 303);

    //  Forward all cookies to browser
    for (const cookie of response.setCookie ?? []) {
      res.headers.append('set-cookie', cookie);
    }

    //  disable caching
    res.headers.set('Cache-Control', 'no-store');

    return res;
  } catch (error) {
    console.error(error);
    /**
     * Refresh failed → login
     */
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', next);

    return NextResponse.redirect(loginUrl, 303);
  }
}
