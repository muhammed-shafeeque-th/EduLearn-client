import { verifyAccessToken } from '@/lib/auth/token-utils';
import { serverRefresh } from '@/lib/server-apis';
import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.redirect(new URL(next, req.url));
  } catch (error) {
    console.error(error);
    /**
     * Refresh failed → login
     */
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', next);

    return NextResponse.redirect(loginUrl);
  }
}
