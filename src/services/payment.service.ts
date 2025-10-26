import { BaseService, BaseServiceOptions, RequestOptions } from './base-api/base.service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/utils/auth-client-apis';

interface CreatePaymentPayload {
  orderId: string;
  provider: string;
  amount: { amount: number; currency: string };
  successUrl?: string;
  cancelUrl?: string;
}

type Money = {
  amount: number;
  currency: string;
};

type PaymentResponse =
  | {
      paypal: {
        paymentId: string;
        userId: string;
        orderId: string;
        providerOrderId: string;
        amount: Money | undefined;
        status: string;
        approvalUrl: string;
      };
    }
  | {
      razorpay: {
        paymentId: string;
        userId: string;
        orderId: string;
        providerOrderId: string;
        amount: Money | undefined;
        status: string;
        keyId: string;
      };
    }
  | {
      stripe: {
        paymentId?: string | undefined;
        userId?: string | undefined;
        orderId?: string | undefined;
        clientSecret?: string | undefined;
        amount?: Money | undefined;
        status?: string | undefined;
        transactionId?: string | undefined;
      };
    };

interface RazorpayVerifyPayload {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}
interface CapturePaypalPayload {
  orderId: string;
  paymentId: string;
  providerOrderId: string;
}

export interface IPaymentService {
  createPayment(
    payload: CreatePaymentPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PaymentResponse>>;
  verifyRazorpayPayment(
    payload: RazorpayVerifyPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<any>>;
  capturePaypalPayment(
    payload: CapturePaypalPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<any>>;
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

  public async capturePaypalPayment(
    payload: CapturePaypalPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/paypal/capture`, payload, options);
  }

  public async verifyRazorpayPayment(
    payload: RazorpayVerifyPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/razorpay/verify`, payload, options);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static forSSR(serviceOptions: BaseServiceOptions) {
    return new PaymentService(serviceOptions);
  }
}

// Singleton for client-side usage
export const cartService: IPaymentService = new PaymentService({});
