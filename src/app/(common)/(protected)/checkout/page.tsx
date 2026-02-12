import { Suspense } from 'react';
import { Metadata } from 'next';
import { CheckoutContent } from './_/components/checkout-content';
import { CheckoutSkeleton } from './loading';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Review and complete your course purchase',
};

interface CheckoutPageProps {
  searchParams: Promise<{
    orderId?: string;
    error_code?: string;
    courseId?: string;
    type?: 'course' | 'cart';
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { orderId, courseId, type } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent
          existingOrderId={orderId}
          courseId={courseId}
          checkoutType={type || 'cart'}
        />
      </Suspense>
    </div>
  );
}
