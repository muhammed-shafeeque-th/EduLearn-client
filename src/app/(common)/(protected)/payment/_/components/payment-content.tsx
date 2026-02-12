'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSelector } from '@xstate/react';
import { ArrowLeft, Shield, CreditCard, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { StripeCheckout } from './providers/stripe-payment-provider';
import { PayPalButtons } from './providers/paypal-payment-provider';
import { RazorpayCheckout } from './providers/rozorpay-payment-provider';
import { toast } from '@/hooks/use-toast';
import { useOrderMachine } from '@/hooks/use-order-machine';
import type { PaymentProvider } from '@/services/payment.service';
import type {
  PaymentProof,
  PaypalSession,
  RazorpaySession,
  StripeSession,
} from '@/lib/machines/order-machine';
import type { Order } from '@/types/order';
import { normalizeCurrencyAmount } from '@/lib/utils';

const SESSION_MESSAGES = [
  'Creating payment session...',
  'Almost there...',
  'It may take a few seconds...',
  'Please do not refresh the page.',
  'Preparing your secure checkout...',
];

function useSessionLoaderMessage(enabled: boolean) {
  const [msgIndex, setMsgIndex] = useState(0);

  useInterval(
    () => {
      setMsgIndex((idx) => (idx + 1) % SESSION_MESSAGES.length);
    },
    enabled ? 2500 : null
  );

  useEffect(() => {
    if (enabled) setMsgIndex(0);
  }, [enabled]);

  return SESSION_MESSAGES[msgIndex];
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }
    const id = setInterval(() => savedCallback.current && savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export type FlowPhase =
  | 'loading'
  | 'selecting'
  | 'creatingSession'
  | 'provider'
  | 'resolving'
  | 'polling'
  | 'completed';

type PaymentContentProps = {
  courseId?: string;
  paymentId?: string;
  orderId: string;
  order: Order;
};

const PAYMENT_METHODS: Array<{
  id: PaymentProvider;
  name: string;
  description: string;
  fee: string;
  icon: () => ReactNode;
}> = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accepts Visa, Mastercard, American Express',
    fee: '2.9% fee',
    icon: () => (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-indigo-500 to-cyan-600 shadow-lg ring-1 ring-indigo-200">
        <CreditCard className="w-6 h-6 text-white" />
      </span>
    ),
  },
  // {
  //   id: 'paypal',
  //   name: 'PayPal',
  //   description: 'Checkout with your PayPal balance or linked bank',
  //   fee: '3.5% fee',
  //   icon: () => (
  //     <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 shadow-lg ring-1 ring-blue-200">
  //       <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="w-6 h-6">
  //         <path
  //           d="M27.8 9.5c0.4-2.7-1.7-4.2-4.7-4.2h-6l-1.1 7h3.8c1.1 0 1.9-0.4 2.1-1.4h1.9l-0.4 2.6c-0.2 1.4-1.6 2.3-3.1 2.3h-4.2l-1.1 7.2h3.4c0.7 0 1.3-0.5 1.4-1.1l0.2-1.1h2c0.7 0 1.3-0.5 1.4-1.2l1.3-8.1z"
  //           fill="#fff"
  //         />
  //       </svg>
  //     </span>
  //   ),
  // },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'UPI, Net Banking, Cards, Wallets',
    fee: '2.4% fee',
    icon: () => (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 shadow-lg ring-1 ring-blue-200">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="w-6 h-6">
          <path
            d="M28.8 4.2h-8.8c-0.8 0-1.5 0.5-1.7 1.3l-9.3 21.9c-0.4 0.8 0.2 1.7 1.1 1.7h5.7c0.7 0 1.3-0.4 1.6-1.1l11.1-23.1z"
            fill="#fff"
            stroke="#2563eb"
            strokeWidth="1"
          />
          <rect x="3" y="24" width="7" height="2.5" rx="1.1" fill="#3b82f6" />
        </svg>
      </span>
    ),
  },
];

type StripeSessionShape = StripeSession;
type PaypalSessionShape = PaypalSession;
type RazorpaySessionShape = RazorpaySession;

const formatCurrency = (value?: number | null) => `₹${normalizeCurrencyAmount(value)}`;

const isAfterOrderCreated = (orderStateValue: string | object) => {
  if (typeof orderStateValue === 'string') {
    return [
      'providerUI',
      'resolvingPayment',
      'polling',
      'succeeded',
      'failure',
      'cancelled',
    ].includes(orderStateValue);
  }
  return false;
};

export function PaymentContent({ courseId, orderId, order: serverOrder }: PaymentContentProps) {
  const router = useRouter();
  const orderService = useOrderMachine();
  const orderState = useSelector(orderService, (state) => state);
  const { order, providerSession, provider, error } = orderState.context;

  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider>('stripe');
  const [loadingOrder, setLoadingOrder] = useState(true);
  const hasRedirectedRef = useRef(false);
  const hasTriggeredUIRef = useRef(false);
  const lastErrorRef = useRef<string | null>(null);

  const applyProviderSelection = useCallback(
    (nextProvider: PaymentProvider) => {
      if (provider !== nextProvider) {
        orderService.send({ type: 'SELECT_PROVIDER', provider: nextProvider });
      }
    },
    [orderService, provider]
  );

  const handleSelectProvider = useCallback(
    (provider: PaymentProvider) => {
      if (isAfterOrderCreated(orderState.value)) {
        toast.error({
          title:
            'Cannot change payment method after payment has begun. Please refresh if you want to restart payment.',
        });
        return;
      }
      setSelectedMethod(provider);
    },
    [orderState, setSelectedMethod]
  );

  // useEffect(() => {
  //   if (selectedMethod === 'razorpay' && typeof window !== 'undefined') {
  //     if (!window.Razorpay) {
  //       const script = document.createElement('script');
  //       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //       script.async = true;
  //       document.head.appendChild(script);
  //     }
  //   }
  // }, [selectedMethod]);

  useEffect(() => {
    async function hydrateExistingOrder() {
      orderService.send({
        type: 'HYDRATE_ORDER',
        order: serverOrder,
        provider: (serverOrder.paymentDetails?.provider as PaymentProvider | undefined) ?? null,
      });

      const inferredProvider =
        (serverOrder.paymentDetails?.provider as PaymentProvider | undefined) ?? provider;
      if (inferredProvider) {
        setSelectedMethod(inferredProvider);
        applyProviderSelection(inferredProvider);
      }

      setLoadingOrder(false);
    }
    hydrateExistingOrder();
    return () => {};
  }, [orderId, courseId, router, serverOrder, provider, orderService, applyProviderSelection]);

  useEffect(() => {
    applyProviderSelection(selectedMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod]);

  useEffect(() => {
    if (provider && provider !== selectedMethod) {
      setSelectedMethod(provider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    if (orderState.matches('awaitingProvider') && providerSession && !hasTriggeredUIRef.current) {
      orderService.send({ type: 'TRIGGER_PROVIDER_UI' });
      hasTriggeredUIRef.current = true;
    }

    if (orderState.matches('providerUI')) {
      hasTriggeredUIRef.current = true;
    }

    if (orderState.matches('orderCreated') || orderState.matches('failure')) {
      hasTriggeredUIRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderState.value, providerSession, orderService]);

  useEffect(() => {
    if (!order) return;

    if (orderState.matches('succeeded') && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace(`/payment/success?orderId=${order.id}`);
      return;
    }

    if (
      (orderState.matches('failure') || orderState.matches('cancelled')) &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;
      const params = new URLSearchParams({ orderId: order.id });
      if (error) params.set('err', error);
      router.replace(`/payment/failure?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderState.value, order, router, error]);

  useEffect(() => {
    if (orderState.matches('failure') && error && error !== lastErrorRef.current) {
      toast.error({ title: error });
      lastErrorRef.current = error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderState.value, error]);

  const phase: FlowPhase = useMemo(() => {
    if (loadingOrder) return 'loading';
    if (orderState.matches('succeeded')) return 'completed';
    if (orderState.matches('polling')) return 'polling';
    if (orderState.matches('resolvingPayment')) return 'resolving';
    if (orderState.matches('providerUI')) return 'provider';
    if (orderState.matches('creatingProviderSession') || orderState.matches('awaitingProvider')) {
      return 'creatingSession';
    }
    return 'selecting';
  }, [orderState, loadingOrder]);

  const isActionDisabled =
    phase === 'loading' ||
    phase === 'creatingSession' ||
    phase === 'provider' ||
    phase === 'resolving' ||
    phase === 'polling';

  const paymentSession = providerSession;
  const stripeSession =
    paymentSession?.provider === 'stripe'
      ? ((paymentSession.stripe as StripeSessionShape | undefined) ?? undefined)
      : undefined;
  const paypalSession =
    paymentSession?.provider === 'paypal'
      ? ((paymentSession.paypal as PaypalSessionShape | undefined) ?? undefined)
      : undefined;
  const razorpaySession =
    paymentSession?.provider === 'razorpay'
      ? ((paymentSession.razorpay as RazorpaySessionShape | undefined) ?? undefined)
      : undefined;

  const handleCreateSession = useCallback(() => {
    if (!order) {
      toast.error({ title: 'Order details not found' });
      return;
    }

    const urlsAvailable = typeof window !== 'undefined';
    orderService.send({
      type: 'CREATE_PROVIDER_SESSION',
      payload: {
        successUrl: urlsAvailable ? `${window.location.origin}/payment/return` : undefined,
        cancelUrl: urlsAvailable ? `${window.location.origin}/payment/failure` : undefined,
      },
    });
  }, [order, orderService]);

  const handlePaymentConfirmation = useCallback(
    (proof: PaymentProof) => {
      orderService.send({ type: 'PAYMENT_CONFIRMED_CLIENT', proof });
    },
    [orderService]
  );

  const handleProviderError = useCallback(
    (message: string) => {
      toast.error({ title: message });
      orderService.send({ type: 'CANCEL' });
    },
    [orderService]
  );

  const orderSummary = (order ?? null) as Order | null;

  const showSessionLoader = phase === 'creatingSession';
  const sessionLoaderMessage = useSessionLoaderMessage(showSessionLoader);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Elegant Fullscreen Transparent Loader Overlay for 'creatingSession' */}
      <AnimatePresence>
        {showSessionLoader && (
          <motion.div
            key="creating-session-global-loader"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto"
            style={{
              minHeight: '100vh',
              minWidth: '100vw',
              background: 'rgba(248,250,252,0.8)', // light glass effect on light, fallback
              backgroundImage:
                'linear-gradient(119deg, rgba(244,246,255,0.95) 0%, rgba(239,248,255,0.65) 50%, rgba(248,250,252,0.92) 100%)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
            aria-live="polite"
            aria-busy="true"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 275,
                damping: 23,
                mass: 0.84,
                duration: 0.28,
              }}
              className="flex flex-col items-center justify-center gap-5 rounded-2xl border shadow-lg bg-white/75 dark:bg-neutral-950/85 p-10 sm:p-12 max-w-xs w-full text-center ring-1 ring-inset ring-black/10"
            >
              <motion.div
                className="bg-primary/10 rounded-full p-4 mb-3"
                initial={{ scale: 0.92, opacity: 0.66 }}
                animate={{
                  scale: [1, 1.07, 1],
                  opacity: [0.85, 1, 0.92, 1],
                  transition: { repeat: Infinity, duration: 2.25, repeatType: 'mirror' },
                }}
              >
                <Loader2 className="h-14 w-14 md:h-16 md:w-16 animate-spin text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white drop-shadow-sm">
                Preparing {selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}{' '}
                Checkout
              </h3>
              <motion.p
                className="text-base text-muted-foreground mt-1 min-h-[1.3rem] font-medium transition-opacity"
                key={sessionLoaderMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                {sessionLoaderMessage}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/checkout/${courseId}?orderId=${orderId}`)}
          disabled={phase !== 'selecting'}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Checkout
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Secure Payment</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Your payment information is encrypted and secure
            </span>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'loading' && (
              <motion.div
                key="loading-order"
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.32, type: 'spring', damping: 25, stiffness: 180 }}
                className="flex flex-col items-center justify-center gap-4 rounded-xl border p-12 bg-white/70 dark:bg-neutral-900/40 shadow text-center"
              >
                <motion.div
                  className="bg-primary/10 rounded-full p-3"
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{
                    scale: [1, 1.07, 1],
                    opacity: [0.85, 1, 0.92, 1],
                    transition: { repeat: Infinity, duration: 2.6, repeatType: 'mirror' },
                  }}
                >
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold">Fetching order details</h3>
                  <p className="text-muted-foreground mt-2">
                    Hang on while we prepare your secure checkout experience.
                  </p>
                </div>
              </motion.div>
            )}

            {(phase === 'selecting' || phase === 'creatingSession') && (
              <motion.div
                key="select-method"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <motion.button
                        key={method.id}
                        type="button"
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          selectedMethod === method.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/15'
                            : 'border-border hover:border-foreground/50'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectProvider(method.id)}
                        disabled={isActionDisabled}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <method.icon />
                            <div>
                              <h3 className="font-semibold">{method.name}</h3>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {method.fee}
                            </Badge>
                            <div
                              className={`h-4 w-4 rounded-full border-2 ${
                                selectedMethod === method.id
                                  ? 'border-primary bg-primary'
                                  : 'border-muted'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.button>
                    ))}

                    <Button
                      onClick={handleCreateSession}
                      className="w-full mt-6"
                      size="lg"
                      disabled={isActionDisabled || !order}
                    >
                      {phase === 'creatingSession' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {`Connecting to ${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}...`}
                        </>
                      ) : (
                        <>
                          Continue with {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Remove duplicate 'creatingSession' inner loader as it is now global */}
            {/* {phase === 'creatingSession' && (
              <motion.div
                key="creating-session"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 rounded-xl border p-12 text-center"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div>
                  <h3 className="text-xl font-semibold">Preparing {selectedMethod} checkout</h3>
                  <p className="text-muted-foreground mt-2">
                    We are securely creating a payment session with {selectedMethod}.
                  </p>
                </div>
              </motion.div>
            )} */}

            {phase === 'provider' && paymentSession && (
              <motion.div
                key="provider-ui"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {paymentSession.provider === 'stripe' && stripeSession?.sessionId && (
                  <StripeCheckout
                    sessionId={stripeSession.sessionId}
                    amount={stripeSession?.amount ?? order?.subTotal ?? 0}
                    currency={stripeSession?.currency || 'USD'}
                    onSuccess={(sessionId) =>
                      handlePaymentConfirmation({
                        stripe: { sessionId },
                      })
                    }
                    onError={(message) => handleProviderError(message)}
                  />
                )}

                {paymentSession.provider === 'paypal' &&
                  paypalSession &&
                  paypalSession.orderId &&
                  (() => {
                    return (
                      <PayPalButtons
                        orderID={paypalSession.orderId}
                        amount={paypalSession?.amount ?? order?.subTotal ?? 0}
                        onApprove={(payload) =>
                          handlePaymentConfirmation({
                            paypal: {
                              orderId: payload.providerOrderId as string,
                            },
                          })
                        }
                        onError={(message) => handleProviderError(message)}
                      />
                    );
                  })()}

                {paymentSession.provider === 'razorpay' &&
                  razorpaySession &&
                  razorpaySession.orderId && (
                    <RazorpayCheckout
                      key={razorpaySession.orderId}
                      orderData={{
                        amount: {
                          amount: razorpaySession.amount,
                          currency: razorpaySession.currency,
                        },
                        keyId: razorpaySession.keyId,
                        orderId: razorpaySession.orderId,
                      }}
                      userDetails={{
                        email: providerSession?.userDetails?.email,
                        name: providerSession?.userDetails?.name,
                      }}
                      onSuccess={(payload) =>
                        handlePaymentConfirmation({
                          razorpay: payload,
                        })
                      }
                      onError={(message) => handleProviderError(message)}
                    />
                  )}
              </motion.div>
            )}

            {phase === 'resolving' && (
              <motion.div
                key="resolving"
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.38, type: 'spring', damping: 27, stiffness: 190 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-white/80 dark:bg-neutral-900/50 rounded-xl shadow"
              >
                <motion.div
                  className="bg-primary/10 rounded-full p-3 mb-3"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{
                    scale: [1, 1.07, 1],
                    opacity: [0.85, 1, 0.92, 1],
                    transition: { repeat: Infinity, duration: 2.5, repeatType: 'mirror' },
                  }}
                >
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </motion.div>
            )}

            {phase === 'polling' && (
              <motion.div
                key="polling"
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.99 }}
                transition={{ duration: 0.35, type: 'spring', damping: 26, stiffness: 180 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-white/80 dark:bg-neutral-900/55 rounded-xl shadow"
              >
                <div className="relative mb-4">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                  <CheckCircle className="w-6 h-6 text-green-500 absolute top-3 left-3" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Confirming Payment</h3>
                <p className="text-muted-foreground">
                  Your payment is being processed. This usually takes just a moment...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {orderSummary?.items?.map((item) => (
                  <div key={item.courseId} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{item.course?.title ?? item.courseId}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderSummary?.subTotal)}</span>
                </div>
                {orderSummary && orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(orderSummary.discount)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(orderSummary?.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Your payment information is secure and protected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
