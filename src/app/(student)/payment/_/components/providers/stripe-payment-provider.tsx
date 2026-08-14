'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '@/lib/config';

export const stripePromise = loadStripe(config.stripePublishableKey!);

interface StripeCheckoutProps {
  sessionId: string;
  publicKey: string;
  amount: number;
  currency: string;
  onSuccess: (id: string) => void;
  onError: (err: string) => void;
}

export function StripeCheckout({
  sessionId,
  publicKey,
  // amount,
  // currency,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function redirect() {
      try {
        setLoading(true);
        const stripe = await loadStripe(publicKey);

        if (!stripe) throw new Error('Stripe failed to initialize');

        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) throw new Error(error.message);

        // The above should always redirect, but call onSuccess for completeness.
        if (isMounted) onSuccess(sessionId);
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Checkout failed';
        if (isMounted) onError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    redirect();

    return () => {
      isMounted = false;
    };
    // Only run on mount or if sessionId changes.
  }, [sessionId, publicKey, onSuccess, onError]);

  // Show a minimal loading spinner while redirecting.
  return (
    <>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-32"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </motion.div>
      )}
    </>
  );
}
