import { Suspense } from 'react';
import { Metadata } from 'next';
import { FailureContent } from './_/components/failure-content';
import { FailurePageSkeleton } from './_/components/skeletons/failure-page-skeleton';
import { requireAuth } from '@/lib/auth';
import { getServerOrder } from '@/lib/server-apis/order-apis';
import { redirect } from 'next/navigation';
import { ERROR_CODES } from '@/lib/errors/error-codes';

export const metadata: Metadata = {
  title: 'Payment Failed - EduLearn',
  description: 'Payment was not successful',
};

interface FailurePageProps {
  searchParams: Promise<{ orderId?: string; error?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function FailurePage({ searchParams }: FailurePageProps) {
  const { orderId, error } = await searchParams;

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

  // // Allow only success payments
  // if (!['failed', 'cancelled'].includes(order.status)) {
  //   redirect(`/checkout?orderId=${order.id}&error_code=${ERROR_CODES.INVALID_ORDER_STATUS}`);
  // }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<FailurePageSkeleton />}>
        <FailureContent orderId={orderId} error={error} order={order} />
      </Suspense>
    </div>
  );
}
