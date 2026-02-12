'use client';

import { StripeCheckout } from './__providers/stripe-checkout';
import { RazorpayCheckout } from './__providers/razorpay-checkout';
import { PayPalCheckout } from './__providers/paypal-checkout';
import { PaymentHandlers, PaymentProvider, PaymentSessionData } from '../__types';

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
    return <PayPalCheckout orderID={session.orderId!} amount={session.amount} {...handlers} />;
  }

  return null;
}
