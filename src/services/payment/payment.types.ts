export type PaymentProvider = 'stripe' | 'razorpay' | 'paypal';
export interface PaypalSession {
  orderId: string;
  /** PayPal redirect URL */
  approvalLink: string;
}

export interface RazorpaySession {
  providerOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface StripeSession {
  sessionId: string;
  publicKey: string;
  clientSecret: string;
  url: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  orderId: string;
}

export type ProviderSessionResponse = {
  userDetails?: {
    email: string;
    name: string;
  };
  userId: string;
  paymentId: string;
  provider: PaymentProvider;
  stripe?: StripeSession;
  paypal?: PaypalSession;
  razorpay?: RazorpaySession;
};

export interface RazorpayResolvePayload {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}
export interface StripeResolvePayload {
  sessionId: string;
}
export interface PaypalResolvePayload {
  orderId: string;
}

export interface ResolvePaymentPayload {
  provider: PaymentProvider;
  stripe?: StripeResolvePayload;
  razorpay?: RazorpayResolvePayload;
  paypal?: PaypalResolvePayload;
}
export interface ResolvePaymentResponse {
  isResolved: boolean;
  paymentId: string;
  orderId: string;
  provider: PaymentProvider;
}

export interface CancelPaymentPayload {
  providerOrderId: string;
  provider: PaymentProvider;
}

export interface CreatePaymentPayload {
  orderId: string;
}

export interface CreateProviderSessionPayload {
  paymentId: string;
  provider: string;
  successUrl?: string;
  cancelUrl?: string;
}
