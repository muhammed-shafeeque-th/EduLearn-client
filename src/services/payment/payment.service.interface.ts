/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import {
  CancelPaymentPayload,
  CreatePaymentPayload,
  CreateProviderSessionPayload,
  ProviderSessionResponse,
  ResolvePaymentPayload,
  ResolvePaymentResponse,
} from './payment.types';

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
