'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocument, getErrorMessage, getWindow } from '@/lib/utils';

interface PayPalButtonsProps {
  orderID: string;
  onApprove: (data: any) => void;
  onError: (error: string) => void;
  amount: number;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButtons({ orderID, onApprove, onError, amount }: PayPalButtonsProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getWindow()?.paypal && isLoaded) {
      renderPayPalButtons();
    }
  }, [isLoaded, orderID]);

  const renderPayPalButtons = () => {
    // Clear any existing buttons
    const container = getDocument()?.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    if (!getWindow()?.paypal) {
      setError('PayPal SDK not loaded');
      return;
    }

    getWindow()
      ?.paypal.Buttons({
        createOrder: () => orderID,

        onApprove: async (data: any) => {
          try {
            onApprove({
              orderId: data.orderID,
              payerId: data.payerID,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : 'PayPal approval failed';
            setError(message);
            onError(message);
          }
        },

        onError: (err: any) => {
          const message = getErrorMessage(err, 'PayPal payment failed');
          setError(message);
          onError(message);
        },

        onCancel: () => {
          setError('Payment was cancelled');
          onError('Payment was cancelled');
        },

        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 50,
        },
      })
      .render('#paypal-button-container');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          PayPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD&components=buttons`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setError('Failed to load PayPal SDK');
            onError('Failed to load PayPal SDK');
          }}
        />

        <div className="space-y-4">
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                P
              </div>
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Pay with PayPal</h3>
            <p className="text-sm text-muted-foreground">Total: ${amount.toFixed(2)} USD</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div id="paypal-button-container" className="min-h-[60px]">
            {!isLoaded && (
              <div className="flex items-center justify-center h-16 bg-muted rounded-lg">
                <div className="animate-pulse text-sm text-muted-foreground">Loading PayPal...</div>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <span>Powered by PayPal • Buyer Protection included</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
