/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getWindow } from '@/lib/utils';

type RazorpayResponse = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
};

interface RazorpayCheckoutProps {
  orderData: {
    orderId: string;
    amount: {
      amount: number;
      currency: string;
    };
    keyId: string;
  };
  onSuccess: (data: RazorpayResponse) => void;
  onError: (error: string) => void;
  userDetails: {
    name?: string;
    email?: string;
  };
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Triggers the Razorpay UI immediately on mount.
 * No manual UI/button provided. Only a minimal loader and error display.
 */
export function RazorpayCheckout({
  orderData,
  onSuccess,
  onError,
  userDetails,
}: RazorpayCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const windowObj = getWindow();
    if (!windowObj?.Razorpay) {
      setError('Payment system not ready. Please wait.');
      onError('Razorpay SDK not ready');
      return;
    }

    const razorpay = new windowObj.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount.amount,
      currency: orderData.amount.currency,
      name: 'EduLearn',
      description: 'Course Purchase',
      order_id: orderData.orderId,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
      },
      theme: { color: '#f97316' },
      modal: {
        ondismiss: () => {
          if (isMounted) onError('Payment cancelled');
        },
      },
      handler: (response: any) => {
        if (isMounted) {
          onSuccess({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        }
      },
    });

    razorpay.on('payment.failed', (res: any) => {
      if (isMounted) onError(res.error?.description || 'Payment failed');
    });

    // Delay modal open by 1 frame (smoother UX)
    requestAnimationFrame(() => razorpay.open());

    return () => {
      isMounted = false;
    };
  }, [orderData.orderId, onError, onSuccess, orderData, userDetails]);

  // Razorpay SDK loader
  // This will only add script once, and update state on load/error
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[170px] gap-3"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
            Launching Razorpay Secure Payment
          </span>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Complete your payment with UPI, Cards, NetBanking, or Wallets
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
