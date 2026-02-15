'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, BookOpen, ArrowRight, Share2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useSelector } from '@xstate/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SuccessPageSkeleton } from './skeletons/success-page-skeletons';
import { getNavigator, getWindow, normalizeCurrencyAmount } from '@/lib/utils';
import { useOrderMachine } from '@/hooks/use-order-machine';
import { Order } from '@/types/order';

interface SuccessContentProps {
  orderId?: string;
  transactionId?: string;
  order: Order;
}

export function SuccessContent({
  orderId,
  transactionId,
  order: serverOrder,
}: SuccessContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [loading, setLoading] = useState(Boolean(orderId));

  const orderService = useOrderMachine();
  const orderState = useSelector(orderService, (state) => state);
  const { order } = orderState.context;

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    startTransition(async () => {
      if (cancelled) return;

      orderService.send({ type: 'HYDRATE_ORDER', order: serverOrder });

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [orderId, orderService, serverOrder]);

  useEffect(() => {
    if (hasCelebrated) return;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setHasCelebrated(true);
  }, [hasCelebrated]);

  const orderDetails = useMemo(() => order, [order]);
  const paymentIdentifier = orderDetails?.paymentDetails?.paymentId;
  const derivedTransactionId = useMemo(
    () => transactionId ?? paymentIdentifier,
    [transactionId, paymentIdentifier]
  );

  if ((loading || isPending) && orderId) {
    return <SuccessPageSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8">
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
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
            {derivedTransactionId && (
              <p className="text-sm text-muted-foreground">
                Transaction ID: <span className="font-mono">{derivedTransactionId}</span>
              </p>
            )}
          </motion.div>

          <AnimatePresence>
            {orderDetails && (
              <motion.div
                key="order-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="text-left">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-mono text-sm">{orderDetails.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-10 justify-between">
                        <div className="flex items-center gap-2">
                          <span>Subtotal:</span>
                          <span className="font-bold">
                            ₹{normalizeCurrencyAmount(orderDetails.subTotal)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Discount:</span>
                          <span className="font-bold">
                            ₹{normalizeCurrencyAmount(orderDetails.discount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Total:</span>
                          <span className="font-bold">
                            ₹{normalizeCurrencyAmount(orderDetails.totalAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Courses:</span>
                        <span>{orderDetails.items?.length ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/profile/my-courses')}
                size="lg"
                className="flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Access Your Courses
              </Button>

              <Button
                onClick={() => router.push('/courses')}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Browse More Courses
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Button
                onClick={() => getWindow()?.print()}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button> */}

              <Button
                onClick={() => {
                  getNavigator()?.clipboard.writeText(getWindow()?.location.href ?? '');
                }}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Success
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              What&apos;s Next?
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Check your email for course access details and receipt</p>
              <p>• Start learning immediately from your dashboard</p>
              <p>• Join our community forums to connect with other learners</p>
              <p>• Track your progress and earn certificates</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
