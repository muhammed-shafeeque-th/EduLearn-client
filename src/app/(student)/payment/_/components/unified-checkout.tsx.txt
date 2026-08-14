'use client';

import { StripeCheckout } from './providers/stripe-payment-provider';
import { RazorpayCheckout } from './providers/rozorpay-payment-provider';
import { PayPalButtons } from './providers/paypal-payment-provider';
import { PaymentProvider } from '@/services/payment';

interface UnifiedCheckoutProps {
  provider: PaymentProvider;
  session: PaymentSessionData;
  handlers: PaymentHandlers;
}

export function UnifiedCheckout({ provider, session, handlers }: UnifiedCheckoutProps) {
  if (provider === 'stripe') {
    return (
      <StripeCheckout
        amount={session.amount}
        currency={session.currency}
        sessionId={session.sessionId!}
        {...handlers}
      />
    );
  }

  if (provider === 'razorpay') {
    return (
      <RazorpayCheckout
        orderData={{
          providerOrderId: session.providerOrderId!,
          keyId: session.keyId!,
          amount: { amount: session.amount, currency: session.currency },
        }}
        userDetails={session.userDetails || {}}
        {...handlers}
      />
    );
  }

  if (provider === 'paypal') {
    return <PayPalButtons orderID={session.orderId!} amount={session.amount} {...handlers} />;
  }

  return null;
}
