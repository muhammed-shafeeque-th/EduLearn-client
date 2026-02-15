import { NextRequest, NextResponse } from 'next/server';
import { serverPaymentService } from '@/services/server-service-clients';
import { ERROR_CODES } from '@/lib/errors/error-codes';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    // If session id is not present, immediately redirect (fail fast)
    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/payment/failure?error=stripe_session_id_not_found', req.nextUrl)
      );
    }

    let verification = null;
    try {
      verification = await serverPaymentService.resolvePayment({
        provider: 'stripe',
        stripe: { sessionId },
      });
    } catch {
      // Fail immediately if resolvePayment throws or times out
      return NextResponse.redirect(
        new URL(`/checkout?error_code=${ERROR_CODES.STRIPE_VERIFICATION_FAILED}`, req.nextUrl)
      );
    }

    // Defensive: if the backend did not return .success === true, treat as failed
    if (!verification || !verification.success || !verification.data?.orderId) {
      return NextResponse.redirect(
        new URL(`/checkout?error_code=${ERROR_CODES.STRIPE_VERIFICATION_FAILED}`, req.nextUrl)
      );
    }

    // All ok, redirect to payment success page
    return NextResponse.redirect(
      new URL(
        `/payment/success?orderId=${encodeURIComponent(verification.data.orderId)}`,
        req.nextUrl
      )
    );
  } catch {
    // Last ditch error fallback—never let the route get stuck!
    return NextResponse.redirect(
      new URL(`/checkout?error_code=${ERROR_CODES.UNEXPECTED_SERVER_ERROR}`, req.url)
    );
  }
}
