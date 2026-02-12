'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Receipt, Sparkles, CreditCard, Loader2 } from 'lucide-react';
import { OrderSummary } from '../../../../../../types/checkout';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  summary: OrderSummary;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
  isProcessing?: boolean;
}

const LOADING_MESSAGES = [
  'Creating order…',
  'Securing your checkout…',
  'Almost there…',
  'This may take a few seconds…',
  'Making sure everything is safe…',
];

export function OrderSummaryCard({
  summary,
  onCheckout,
  showCheckoutButton = false,
  isProcessing = false,
}: OrderSummaryProps) {
  const hasDiscount = summary.discount > 0;
  const hasTax = summary.tax > 0;

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setLoadingMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <Card className="sticky top-4 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary dark:to-blue-950/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="w-5 h-5 text-primary" />
          Order Summary
          {summary.itemCount > 0 && (
            <span className="bg-primary/10 dark:bg-primary text-primary dark:text-white px-2 py-1 rounded-full text-xs font-medium">
              {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(summary.subtotal, summary.currency)}</span>
        </div>

        {/* Discount */}
        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex justify-between items-center text-green-600"
          >
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Discount
            </span>
            <span className="font-medium">-{formatPrice(summary.discount, summary.currency)}</span>
          </motion.div>
        )}

        {/* Tax */}
        {hasTax && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatPrice(summary.tax, summary.currency)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-2"></div>

        {/* Total */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex justify-between items-center text-lg font-bold"
        >
          <span>Total</span>
          <div className="text-right">
            <div className="text-primary text-xl">
              {formatPrice(summary.total, summary.currency)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(summary.subtotal + summary.tax, summary.currency)}
              </div>
            )}
          </div>
        </motion.div>

        {/* Savings Badge */}
        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                You&apos;re saving {formatPrice(summary.discount, summary.currency)}!
              </span>
            </div>
          </motion.div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          className="w-full h-12 text-base font-semibold mt-6"
          variant="default"
          disabled={!showCheckoutButton || isProcessing || summary.total <= 0}
        >
          {isProcessing ? (
            <div className="flex items-center w-full justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </>
          )}
        </Button>

        {/* Security Notice and animated progress while creating order */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center justify-center gap-1 mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
            <span>SSL secured checkout</span>
          </div>
          <span>Your payment information is encrypted and secure</span>

          {/* While processing, show an animated progress bar */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                className="mt-4 w-full flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="h-2 w-40 rounded-full bg-gradient-to-r from-blue-200 to-blue-600 dark:from-blue-900 dark:to-blue-400 overflow-hidden relative"
                  initial={{ backgroundPositionX: 0 }}
                  animate={{ backgroundPositionX: [0, 160, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200% 100%',
                    backgroundImage:
                      'linear-gradient(90deg,rgba(80,160,255,0.2) 0%,rgba(80,160,255,0.7) 40%,rgba(160,220,255,0.2) 100%)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
