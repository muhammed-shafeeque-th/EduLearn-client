/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import {
  CancelPaymentPayload,
  CreatePaymentPayload,
  CreateProviderSessionPayload,
  ProviderSessionResponse,
  ResolvePaymentPayload,
  ResolvePaymentResponse,
} from './payment.types';
import { IPaymentService } from './payment.service.interface';

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
