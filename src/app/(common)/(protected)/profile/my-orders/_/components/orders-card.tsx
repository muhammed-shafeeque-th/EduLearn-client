'use client';

import { memo, useState, useCallback, useTransition } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { OrderHeader } from './orders-header';
import { OrderList } from './order-item-list';
import { PriceBreakdown } from './price-breakdown';
import { PaymentDetails } from './payment-details';
import type { Order } from '@/types/order';
import { useOrder } from '@/states/server/orders/use-orders';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { restoreOrder, isRestoring, restoreError } = useOrder(order.id, { enabled: false });
  const [isPending, startTransition] = useTransition();

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleRetryPayment = useCallback(() => {
    startTransition(async () => {
      try {
        await restoreOrder();
        router.push(`/payment?orderId=${order.id}`);
      } catch (error) {
        // Error will be handled below via restoreError
        console.error('Payment retry failed:', error);
      }
    });
  }, [order.id, restoreOrder, router]);

  const handleGoToPayment = useCallback(() => {
    router.push(`/payment?orderId=${order.id}`);
  }, [order.id, router]);

  // Show only first item by default; expand for all
  const VISIBLE_COURSE_COUNT = 1;
  const visibleCourses = expanded ? order.items : order.items.slice(0, VISIBLE_COURSE_COUNT);
  const hasMoreCourses = order.items.length > VISIBLE_COURSE_COUNT;
  const remainingCount = order.items.length - VISIBLE_COURSE_COUNT;

  return (
    <article
      className="bg-card rounded-lg border border-border overflow-hidden shadow-xs"
      aria-label={`Order ${order.id}`}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <OrderHeader order={order} />
        </div>

        <OrderList orderItems={visibleCourses} />

        {hasMoreCourses && !expanded && (
          <button
            onClick={handleToggleExpand}
            className="w-full text-xs font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 py-1 transition-colors"
            aria-expanded={expanded}
            type="button"
          >
            Show {remainingCount} more course
            {remainingCount !== 1 ? 's' : ''}
            <ChevronDown className="w-3 h-3" aria-hidden="true" />
          </button>
        )}

        <div className="my-2 border-t border-border" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <PriceBreakdown
            subtotal={order.subTotal}
            discount={order.discount}
            total={order.totalAmount}
            currency={order.currency}
          />
          <PaymentDetails
            paymentMethod={order.paymentDetails?.provider}
            paymentStatus={order.paymentDetails?.paymentStatus}
            failureReason={'NULL'}
          />
        </div>

        {/* Created status: Go to Payment button */}
        {order.status === 'created' && (
          <div className="mt-3">
            <button
              onClick={handleGoToPayment}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              aria-label="Continue to payment"
              type="button"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Go to Payment
            </button>
          </div>
        )}

        {/* Retry Payment Button with React Query loading and error state */}
        {order.status === 'failed' && (
          <div className="mt-3">
            <button
              onClick={handleRetryPayment}
              disabled={isPending || isRestoring}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              aria-label="Retry payment"
              type="button"
            >
              {isPending || isRestoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Retry Payment
                </>
              )}
            </button>
            {/* Error display */}
            {restoreError && (
              <div className="text-destructive mt-2 text-xs px-2">
                {typeof restoreError === 'string'
                  ? restoreError
                  : 'Failed to retry payment. Please try again.'}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
