import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import { Order, OrderStatus, PlaceOrderPayload } from '@/types/order';
import { OrderParams } from './order.types';

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
