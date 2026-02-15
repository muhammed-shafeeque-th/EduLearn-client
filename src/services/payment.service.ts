/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';

interface CreatePaymentPayload {
  orderId: string;
  provider: string;
  successUrl?: string;
  cancelUrl?: string;
}

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
  /** Stripe hosted checkout URL (optional) */
  url: string;
}

// Response type after creating payment session
type PaymentResponse = {
  userDetails?: {
    email: string;
    name: string;
  };
  paymentId: string;
  status: string;
  userId: string;
  orderId: string;
  stripe?: StripeSession;
  paypal?: PaypalSession;
  razorpay?: RazorpaySession;
};

// type Money = {
//   amount: number;
//   currency: string;
// };

// type PaymentResponse =
//   | {
//       paypal: {
//         paymentId: string;
//         userId: string;
//         orderId: string;
//         providerOrderId: string;
//         amount: Money | undefined;
//         status: string;
//         approvalUrl: string;
//       };
//     }
//   | {
//       razorpay: {
//         paymentId: string;
//         userId: string;
//         orderId: string;
//         providerOrderId: string;
//         amount: Money | undefined;
//         status: string;
//         keyId: string;
//       };
//     }
//   | {
//       stripe: {
//         paymentId?: string | undefined;
//         userId?: string | undefined;
//         orderId?: string | undefined;
//         clientSecret?: string | undefined;
//         amount?: Money | undefined;
//         status?: string | undefined;
//         transactionId?: string | undefined;
//       };
//   azorpayResolvePayload

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

interface ResolvePaymentPayload {
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

export type PaymentProvider = 'stripe' | 'razorpay' | 'paypal';

// interface ResolvePaymentPayload {
//   provider: PaymentProvider;
//   paymentId: string;
//   providerSessionId: string;
//   providerPaymentId?: string;
//   providerSignature?: string;
// }
interface CancelPaymentPayload {
  providerOrderId: string;
  provider: PaymentProvider;
}

export interface IPaymentService {
  createPayment(
    payload: CreatePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PaymentResponse>>;
  resolvePayment(
    payload: ResolvePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<ResolvePaymentResponse>>;
  cancelPayment(payload: CancelPaymentPayload, options?: RequestOptions): Promise<ApiResponse<any>>;
  getPayment(paymentId: string, options?: RequestOptions): Promise<ApiResponse<any>>;
}

export class PaymentService extends BaseService implements IPaymentService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/payments`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async createPayment(
    payload: CreatePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.post<ApiResponse<PaymentResponse>>(`/${payload.provider}/create`, payload, options);
  }

  public async cancelPayment(
    payload: CancelPaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    return this.patch<ApiResponse<any>>(`/${payload.provider}/cancel`, payload, options);
  }

  public async resolvePayment(
    payload: ResolvePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<ResolvePaymentResponse>> {
    return this.patch<ApiResponse<any>>(`/${payload.provider}/resolve`, payload, options);
  }
  public async getPayment(paymentId: string, options?: RequestOptions): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(`/${paymentId}`, options);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(serviceOptions: BaseServiceOptions = {}) {
    return new PaymentService(serviceOptions);
  }
}

// Singleton for client-side usage
export const paymentService: IPaymentService = new PaymentService();
