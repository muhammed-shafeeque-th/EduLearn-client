'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverOrderService, serverPaymentService } from '@/services/server-service-clients';
import { Order } from '@/types/order';
import { fetchApi } from '@/lib/server-apis';
import { config } from '@/lib/config';

interface OrderData {
  courseIds: string[];
  currency?: string;
  userId?: string;
  couponCode?: string;
}

interface PaymentSessionData {
  orderId: string;
  paymentMethod: 'stripe' | 'paypal' | 'razorpay';
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

interface PaymentVerificationData {
  providerOrderId: string;
  orderId: string;
  paymentMethod: string;
  paymentId: string;
  providerSignature?: string;
  providerSessionId?: string;
}

const API_BASE_URL = config.apiUrl;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export async function createOrder(orderData: OrderData) {
  try {
    const orderRes = await serverOrderService.placeOrder(orderData);
    if (!orderRes.success) {
      throw new Error(orderRes.message);
    }

    return { success: true, data: orderRes.data as Order };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}

export async function applyCouponCode(orderId: string, couponCode: string) {
  try {
    const result = await fetchApi(`/orders/${orderId}/coupon`, {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });

    revalidatePath('/checkout');
    return { success: result.success, data: result.success ? result.data : null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid coupon code',
    };
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const orderRes = await serverOrderService.getOrder(orderId);
    if (!orderRes.success) {
      throw new Error(orderRes.message);
    }

    return { success: true, data: orderRes.data as Order };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };
  }
}

export async function createStripePaymentSession(sessionData: PaymentSessionData) {
  try {
    const session = await serverPaymentService.createPayment({
      orderId: sessionData.orderId,
      provider: 'stripe',
      successUrl: sessionData.successUrl,
      cancelUrl: sessionData.cancelUrl,
    });
    if (!session.success) {
      throw new Error(session.message);
    }
    console.log('Server Resposen + ' + JSON.stringify(session, null, 2));

    return { success: true, data: session.data?.stripe };
  } catch (error) {
    console.log('Server error + ' + JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Stripe session',
    };
  }
}

export async function createPayPalOrder(sessionData: PaymentSessionData) {
  try {
    const order = await serverPaymentService.createPayment({
      orderId: sessionData.orderId,
      provider: 'paypal',
    });
    if (!order.success) {
      throw new Error(order.message);
    }
    console.log('Server Resposen + ' + JSON.stringify(order, null, 2));

    return { success: true, data: order.data?.paypal };
  } catch (error) {
    console.log('Server error + ' + JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create PayPal order',
    };
  }
}

export async function createRazorpayOrder(sessionData: PaymentSessionData) {
  try {
    const order = await serverPaymentService.createPayment({
      orderId: sessionData.orderId,
      provider: 'razorpay',
    });
    if (!order.success) {
      throw new Error(order.message);
    }

    console.log('Server Resposen + ' + JSON.stringify(order, null, 2));

    return { success: true, data: order.data?.razorpay };
  } catch (error) {
    console.log('Server error + ' + JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Razorpay order',
    };
  }
}

export async function verifyStripePayment(verificationData: PaymentVerificationData) {
  try {
    const result = await serverPaymentService.verifyPayment({
      orderId: verificationData.providerOrderId,
      sessionId: verificationData.providerSessionId,
    });

    if (result.success) {
      redirect(`/checkout/success?orderId=${verificationData.orderId}`);
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

export async function verifyPayPalPayment(verificationData: PaymentVerificationData) {
  try {
    const result = await serverPaymentService.verifyPayment({
      orderId: verificationData.orderId,
      paymentId: verificationData.paymentId,
      providerOrderId: verificationData.providerOrderId,
    });

    if (result.success) {
      redirect(`/checkout/success?orderId=${verificationData.orderId}`);
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PayPal verification failed',
    };
  }
}

export async function verifyRazorpayPayment(verificationData: PaymentVerificationData) {
  try {
    const result = await serverPaymentService.verifyPayment({
      paymentId: verificationData.paymentId,
      razorpayOrderId: verificationData.providerOrderId,
      razorpayPaymentId: verificationData.providerSessionId!,
      razorpaySignature: verificationData.providerSignature,
    });

    if (result.success) {
      redirect(`/checkout/success?orderId=${verificationData.orderId}`);
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Razorpay verification failed',
    };
  }
}

export async function getPaymentStatus(orderId: string) {
  try {
    const status = await apiCall(`/api/payments/status/${orderId}`);
    return { success: true, data: status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment status',
    };
  }
}

export async function proceedToPayment(orderId: string, courseId?: string) {
  const basePath = courseId ? `/checkout/${courseId}` : '/checkout';
  redirect(`${basePath}/payment?orderId=${orderId}`);
}

export async function redirectToFailure(orderId: string, error?: string) {
  const params = new URLSearchParams({ orderId });
  if (error) params.set('error', error);
  redirect(`/checkout/failure?${params.toString()}`);
}
