import { serverOrderService } from '@/services/server-service-clients';
import { Order } from '@/types/order';
import { cache } from 'react';

export const getServerOrder = cache(async (orderId: string) => {
  try {
    const orderRes = await serverOrderService.getOrder(orderId);
    if (!orderRes.success) {
      throw new Error(orderRes.message);
    }

    return { success: true, order: orderRes.data as Order };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };
  }
});
