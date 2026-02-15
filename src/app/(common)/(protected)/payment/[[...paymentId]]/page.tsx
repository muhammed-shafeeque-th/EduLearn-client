import { Suspense } from 'react';
import { Metadata } from 'next';
import { PaymentContent } from '../_/components/payment-content';
import { redirect } from 'next/navigation';
import { PaymentPageSkeleton } from '../_/components/skeletons/payment-page-skeleton';
import { getServerOrder } from '@/lib/server-apis/order-apis';
import { requireAuth } from '@/lib/auth';
import { ERROR_CODES } from '@/lib/errors/error-codes';

export const metadata: Metadata = {
  title: 'Payment - EduLearn',
  description: 'Complete your secure payment',
};

interface PaymentPageProps {
  params: Promise<{ courseId?: string; paymentId?: string }>;
  searchParams: Promise<{ orderId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { courseId, paymentId } = await params;
  const { orderId } = await searchParams;

  // Ensure paymentId (string[] because optional catch all)
  const normalizedPaymentId = Array.isArray(paymentId) ? paymentId[0] : paymentId;

  if (!orderId || typeof orderId !== 'string') {
    redirect(`/checkout?error=${ERROR_CODES.MISSING_ORDER_ID}`);
  }

  // Authenticate user
  const user = await requireAuth();

  // Fetch and validate order
  const { success, order } = await getServerOrder(orderId);
  console.log('Order : ' + JSON.stringify(order, null, 2));

  if (!success || !order) {
    // Unable to find the order or failed fetch
    redirect(`/checkout?error_code=${ERROR_CODES.ORDER_NOT_FOUND_OR_INVALID}`);
  }

  // Check order ownership
  if (!user?.id || user.id !== order.userId) {
    redirect(`/checkout?error_code=${ERROR_CODES.UNAUTHORIZED_ACCESS}`);
  }

  // redirect to success if order succeeded
  if (order.status === 'succeeded') {
    redirect(`/payment/success?orderId=${order.id}`);
  }

  // redirect to failure if order failed
  // if (['failed', 'cancelled'].includes(order.status)) {
  //   redirect(`/payment/failure?orderId=${order.id}`);
  // }

  // // Allow only success payments
  // if (!['pending_payment', 'processing', 'created'].includes(order.status)) {
  //   redirect(`/checkout?orderId=${order.id}&error_code=${ERROR_CODES.INVALID_ORDER_STATUS}`);
  // }
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PaymentPageSkeleton />}>
        <PaymentContent
          courseId={courseId}
          orderId={orderId!}
          order={order}
          paymentId={normalizedPaymentId}
        />
      </Suspense>
    </div>
  );
}
