'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, CreditCard, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@xstate/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FailurePageSkeleton } from './skeletons/failure-page-skeleton';
import { useOrderMachine } from '@/hooks/use-order-machine';
import { normalizeCurrencyAmount } from '@/lib/utils';
import { Order } from '@/types/order';
import { useOrder } from '@/states/server/orders/use-orders';

interface FailureContentProps {
  orderId?: string;
  order: Order;
  error?: string;
}

export function FailureContent({ orderId, error, order: serverOrder }: FailureContentProps) {
  const router = useRouter();

  const [hydrating, setHydrating] = useState(Boolean(orderId));
  const [isPending, startTransition] = useTransition();

  const { restoreOrder, isRestoring, restoreError } = useOrder(orderId!, { enabled: false });

  const orderService = useOrderMachine();
  const orderState = useSelector(orderService, (state) => state);
  const { order, error: machineError } = orderState.context;

  useEffect(() => {
    if (!orderId) {
      setHydrating(false);
      return;
    }
    let cancelled = false;
    startTransition(() => {
      if (cancelled) return;
      orderService.send({ type: 'HYDRATE_ORDER', order: serverOrder });
      setHydrating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, orderService, serverOrder]);

  const resolvedError = useMemo(() => {
    if (restoreError) {
      if (typeof restoreError === 'string') return restoreError;

      return 'Failed to retry payment. Please try again.';
    }
    return error ?? machineError ?? 'Your payment could not be processed. Please try again.';
  }, [restoreError, error, machineError]);

  const suggestions = useMemo<string[]>(() => {
    const base = [
      'Check your card details and try again',
      'Ensure you have sufficient funds',
      'Try a different payment method',
      'Contact your bank if the issue persists',
    ];
    if (!resolvedError) return base;
    const message = resolvedError.toLowerCase();
    if (message.includes('insufficient')) {
      return ['Ensure you have sufficient funds in your account', ...base.slice(1)];
    }
    if (message.includes('declined')) {
      return ['Contact your bank - your card may be blocked', ...base.slice(1)];
    }
    return base;
  }, [resolvedError]);

  const handleTryAgain = async () => {
    if (isPending || isRestoring) return;
    startTransition(async () => {
      try {
        await restoreOrder();
        router.push(orderId ? `/payment?orderId=${orderId}` : '/checkout');
      } catch {}
    });
  };

  const handleBackToCourses = () => {
    router.push('/courses');
  };

  const handleSupport = () => {
    router.push('/support');
  };

  const handlePaymentHelp = () => {
    router.push('/help/payments');
  };

  if ((hydrating || isPending || isRestoring) && orderId) {
    return <FailurePageSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-white" aria-hidden />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
            <p className="text-xl text-muted-foreground mb-6">
              We couldn&apos;t process your payment. Don&apos;t worry, no charges were made to your
              account.
            </p>
            <Alert className="mb-6" variant="destructive">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <AlertDescription className="text-left">
                <strong>Error:</strong> {resolvedError}
              </AlertDescription>
            </Alert>
          </motion.div>

          {!!order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-mono text-sm">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">
                        ${normalizeCurrencyAmount(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courses:</span>
                      <span>{order.items?.length ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" aria-hidden />
                  What can you do?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1" aria-hidden>
                        •
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleTryAgain}
                size="lg"
                className="flex items-center gap-2"
                aria-label="Try Payment Again"
                disabled={isRestoring || isPending}
              >
                {isRestoring || isPending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" aria-hidden />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" aria-hidden />
                    Try Again
                  </>
                )}
              </Button>

              <Button
                onClick={handleBackToCourses}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
                aria-label="Back to Courses"
                disabled={isRestoring || isPending}
              >
                <ArrowLeft className="w-5 h-5" aria-hidden />
                Back to Courses
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSupport}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Contact Support"
                disabled={isRestoring || isPending}
              >
                <HelpCircle className="w-4 h-4" aria-hidden />
                Contact Support
              </Button>

              <Button
                onClick={handlePaymentHelp}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Payment Help"
                disabled={isRestoring || isPending}
              >
                <CreditCard className="w-4 h-4" aria-hidden />
                Payment Help
              </Button>
            </div>
          </motion.div>

          {restoreError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-4"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                <AlertDescription className="text-left">
                  <strong>Payment retry failed:</strong>{' '}
                  {typeof restoreError === 'string'
                    ? restoreError
                    : 'Failed to retry payment. Please try again.'}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Our support team is here to help you complete your purchase.</p>
              <p className="font-medium">
                Email:{' '}
                <a href="mailto:support@edulearn.com" className="underline hover:text-orange-600">
                  support@edulearn.com
                </a>
              </p>
              <p className="font-medium">Live Chat: Available 24/7</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
