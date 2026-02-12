/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
}

export interface PaymentMethod {
  id: 'stripe' | 'paypal' | 'razorpay';
  name: string;
  description: string;
  logo: React.ComponentType<any>;
  enabled: boolean;
  processingFee?: number;
}

export interface PaymentState {
  isProcessing: boolean;
  selectedMethod: string;
  error: string | null;
  clientSecret?: string;
  orderId?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  savePaymentMethod: boolean;
  billingAddress: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
    line1: string;
    line2?: string;
  };
}
