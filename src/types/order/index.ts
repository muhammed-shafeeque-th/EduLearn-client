import { CourseInfo } from '../course';

export type OrderStatus =
  | 'created'
  | 'pending_payment'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export interface OrderItems {
  courseId: string;
  price: number;
  course: CourseInfo;
}

export interface PaymentDetails {
  paymentId: string;
  provider: string;
  providerOrderId?: string | undefined;
  paymentStatus: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItems[];
  paymentDetails?: PaymentDetails | undefined;
  totalAmount: number;
  discount: number;
  subTotal: number;
  salesTax?: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  userInfo?: {
    email: string;
    name: string;
  };
}

export interface PlaceOrderPayload {
  courseIds: string[];
  userId?: string;
  couponCode?: string;
}

export interface OrderType {
  orderId: string;
  userId?: string;
  amount: number;
  currency: string;
  items: Array<{ id: string; title: string; price: number; qty?: number }>;
  provider?: 'stripe' | 'paypal' | 'razorpay';
  providerSessionId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
