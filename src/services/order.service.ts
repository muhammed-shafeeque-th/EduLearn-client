import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Order, OrderStatus, PlaceOrderPayload } from '@/types/order';

export interface OrderFilters {
  userId?: string;
  status?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}

function getOrderPaginationParams(params?: PaginationParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Note: PaginationParams contains only page, pageSize, sortOrder
  if (params?.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}

export type OrderParams = OrderFilters & PaginationParams;

export interface IOrderService {
  placeOrder(payload: PlaceOrderPayload, options?: RequestOptions): Promise<ApiResponse<Order>>;
  getOrder(orderId: string, options?: RequestOptions): Promise<ApiResponse<Order>>;
  restoreOrder(orderId: string, options?: RequestOptions): Promise<ApiResponse<Order>>;
  getOrderStatus(
    orderId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<{ orderId: string; status: OrderStatus }>>;
  getOrders(params?: OrderParams, options?: RequestOptions): Promise<ApiResponse<Order[]>>;
}

export class OrderService extends BaseService implements IOrderService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/orders`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getOrder(orderId: string, options?: RequestOptions): Promise<ApiResponse<Order>> {
    return this.get<ApiResponse<Order>>(`/${orderId}`, options);
  }
  public async getOrderStatus(
    orderId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<{ orderId: string; status: OrderStatus }>> {
    return this.get<ApiResponse<{ orderId: string; status: OrderStatus }>>(
      `/${orderId}/status`,
      options
    );
  }
  public async getOrders(
    params?: OrderParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Order[]>> {
    const queryParams = getOrderPaginationParams(params);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();

    // FIX: Pass query params as URL search params, not as a path
    return this.get<ApiResponse<Order[]>>(`?${queryString}`, options);
  }

  public async placeOrder(
    payload: PlaceOrderPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Order>> {
    return this.post<ApiResponse<Order>>('/', payload, options);
  }

  public async restoreOrder(
    orderId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Order>> {
    return this.patch<ApiResponse<Order>>(`/${orderId}/reset`, {}, options);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(options: BaseServiceOptions) {
    return new OrderService(options);
  }
}

// Singleton for client-side usage
export const orderService: IOrderService = new OrderService();
