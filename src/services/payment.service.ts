/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';

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


type ProviderSessionResponse = {
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

interface CancelPaymentPayload {
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

export interface IPaymentService {
  createPayment(
    payload: CreatePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PaymentResponse>>;
  createProviderSession(
    payload: CreateProviderSessionPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<ProviderSessionResponse>>;
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
    return this.post<ApiResponse<PaymentResponse>>(`/create`, payload, options);
  }

  public async createProviderSession(
    payload: CreateProviderSessionPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<ProviderSessionResponse>> {
    return this.post<ApiResponse<ProviderSessionResponse>>(
      `/${payload.paymentId}/session`,
      payload,
      options
    );
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

  static create(serviceOptions: BaseServiceOptions = {}) {
    return new PaymentService(serviceOptions);
  }
}

export const paymentService: IPaymentService = new PaymentService();
