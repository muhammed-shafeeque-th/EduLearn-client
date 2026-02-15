import { Suspense } from 'react';
import { Metadata } from 'next';
import { SuccessContent } from './_/components/success-content';
import { SuccessPageSkeleton } from './_/components/skeletons/success-page-skeletons';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { getServerOrder } from '@/lib/server-apis/order-apis';
import { ERROR_CODES } from '@/lib/errors/error-codes';

export const metadata: Metadata = {
  title: 'Payment Successful - EduLearn',
  description: 'Your payment has been processed successfully',
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; tx?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, tx } = await searchParams;

  if (!orderId || typeof orderId !== 'string') {
    redirect(`/checkout?error=${ERROR_CODES.MISSING_ORDER_ID}`);
  }

  // Authenticate user
  const user = await requireAuth();

  // Fetch and validate order
  const { success, order } = await getServerOrder(orderId);

  if (!success || !order) {
    // Unable to find the order or failed fetch
    redirect(`/checkout?error_code=${ERROR_CODES.ORDER_NOT_FOUND_OR_INVALID}`);
  }

  // Check order ownership
  if (!user?.id || user.id !== order.userId) {
    redirect(`/checkout?error_code=${ERROR_CODES.UNAUTHORIZED_ACCESS}`);
  }

  // Allow only pending or completed payments
  if (order.status !== 'succeeded') {
    redirect(`/checkout?orderId=${order.id}&error_code=${ERROR_CODES.INVALID_ORDER_STATUS}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SuccessPageSkeleton />}>
        <SuccessContent orderId={orderId} transactionId={tx} order={order} />
      </Suspense>
    </div>
  );
}
