'use client';

import { useEffect, useMemo, useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@xstate/react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useCourseById } from '@/states/server/course/use-courses';
import { useCart } from '@/states/server/cart/use-cart';
import { getOrderDetails } from '../actions';
import Image from 'next/image';
import { CourseInfo } from '@/types/course';
import { toast } from '@/hooks/use-toast';
import { useOrderMachine } from '@/hooks/use-order-machine';
import type { PaymentProvider } from '@/services/payment.service';
import { normalizeCurrencyAmount } from '@/lib/utils';
import { StateValues } from '@/lib/machines/order-machine';
import { OrderSummaryCard } from './order-summary';

interface CheckoutContentProps {
  existingOrderId?: string;
  courseId?: string;
  checkoutType: 'course' | 'cart';
}

const DEFAULT_PROVIDER: PaymentProvider = 'stripe';

export function CheckoutContent({ existingOrderId, courseId, checkoutType }: CheckoutContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { data: courseRes } = useCourseById(courseId!, { enabled: !!courseId });
  const { cart, removeFromCart, clearCart } = useCart({ enabled: true });

  const orderService = useOrderMachine();
  const orderState = useSelector(orderService, (state) => state);
  const { order, provider, error: machineError } = orderState.context;

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(DEFAULT_PROVIDER);

  const hasRedirectedRef = useRef(false);

  const hasClearedCartRef = useRef(false);

  const computeOrderFigures = (items: CourseInfo[]) => {
    let total = 0;
    let subtotal = 0;
    let discount = 0;
    for (const item of items) {
      const price = item.price ?? 0;
      const discountPrice = item.discountPrice ?? price;
      subtotal += price;
      total += discountPrice;
      discount += price - discountPrice;
    }
    return {
      subtotal,
      discount,
      total,
    };
  };

  const [orderData, setOrderData] = useState({
    orderId: existingOrderId || '',
    items: [] as CourseInfo[],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    currency: 'INR',
  });

  // const [couponForm, setCouponForm] = useState({
  //   code: '',
  //   applied: false,
  //   discount: 0,
  // });

  useEffect(() => {
    if (
      !['idle', 'orderCreated', 'failure'].some((state) => orderState.matches(state as StateValues))
    ) {
      return;
    }

    if (selectedProvider && selectedProvider !== provider) {
      orderService.send({ type: 'SELECT_PROVIDER', provider: selectedProvider });
    }
  }, [selectedProvider, provider, orderService, orderState]);

  useEffect(() => {
    if (orderState.matches('orderCreated') && order?.id && !hasRedirectedRef.current) {
      setOrderData((prev) => ({
        ...prev,
        orderId: order.id,
        subtotal: normalizeCurrencyAmount(order.subTotal),
        total: normalizeCurrencyAmount(order.totalAmount),
        discount: normalizeCurrencyAmount(order.discount),
        tax: normalizeCurrencyAmount(order.salesTax),
        currency: order.currency,
      }));

      hasRedirectedRef.current = true;

      if (checkoutType === 'cart' && cart?.id && !hasClearedCartRef.current) {
        clearCart().catch(console.error);
        hasClearedCartRef.current = true;
      }

      setTimeout(() => router.push(`/payment?orderId=${order.id}`), 0);
    }

    if (!orderState.matches('orderCreated')) {
      hasRedirectedRef.current = false;
      hasClearedCartRef.current = false;
    }
  }, [orderState.value, order, orderState, router, checkoutType, cart?.id, clearCart]);

  useEffect(() => {
    if (orderState.matches('failure') && machineError) {
      toast.error({ title: machineError });
    }
  }, [orderState, machineError]);

  useEffect(() => {
    let ignore = false;

    if (existingOrderId) {
      startTransition(async () => {
        const result = await getOrderDetails(existingOrderId);
        if (ignore) return;
        if (result.success && result.data) {
          setOrderData((prev) => ({
            ...prev,
            currency: result.data.currency,
            discount: normalizeCurrencyAmount(result.data.discount),
            items: result.data.items.map((item) => item.course as CourseInfo),
            orderId: result.data.id,
            subtotal: normalizeCurrencyAmount(result.data.subTotal),
            total: normalizeCurrencyAmount(result.data.totalAmount),
          }));

          orderService.send({
            type: 'HYDRATE_ORDER',
            order: result.data,
            provider:
              (result.data.paymentDetails?.provider as PaymentProvider | undefined) ??
              DEFAULT_PROVIDER,
          });

          if (result.data.paymentDetails?.provider) {
            setSelectedProvider(result.data.paymentDetails.provider as PaymentProvider);
          }
        }
      });
    } else {
      let items: CourseInfo[] = [];
      if (checkoutType === 'course' && courseRes) {
        items = [courseRes];
      } else if (cart?.items) {
        items = cart.items.map((item) => item.course);
      }

      const figures = computeOrderFigures(items);

      setOrderData((prev) => ({
        ...prev,
        items,
        subtotal: figures.subtotal,
        total: figures.total,
        discount: figures.discount,
      }));
    }
    return () => {
      ignore = true;
    };
  }, [existingOrderId, courseRes, cart?.items, checkoutType, orderService]);

  // const handleApplyCoupon = async () => {
  //   if (!couponForm.code.trim()) {
  //     toast.error({ title: 'Please enter a coupon code' });
  //     return;
  //   }

  //   if (!orderData.orderId) {
  //     toast.error({ title: 'Please create order first' });
  //     return;
  //   }

  //   startTransition(async () => {
  //     const result = await applyCouponCode(orderData.orderId, couponForm.code);

  //     if (result.success) {
  //       const discount = result.data?.discount || 0;
  //       setCouponForm((prev) => ({ ...prev, applied: true, discount }));
  //       setOrderData((prev) => ({
  //         ...prev,
  //         discount,
  //         total: prev.subtotal - discount, // discounted total in cents
  //       }));
  //       toast.success({
  //         title: `Coupon applied! You saved ₹${discount.toFixed(2)}`,
  //       });
  //     } else {
  //       toast.error({ title: result.error || 'Invalid coupon code' });
  //     }
  //   });
  // };

  const handleRemoveItem = async (itemId: string) => {
    const newItems = orderData.items.filter((item) => item.id !== itemId);
    const figures = computeOrderFigures(newItems);

    setOrderData((prev) => ({
      ...prev,
      items: newItems,
      subtotal: figures.subtotal,
      discount: figures.discount,
      total:
        figures.subtotal - (prev.discount > figures.discount ? prev.discount : figures.discount),
    }));

    if (checkoutType === 'cart' && cart?.id) {
      await removeFromCart({ courseId: itemId });
    }
  };

  const isCreatingOrder =
    isPending ||
    orderState.matches('creatingOrder') ||
    orderState.matches('creatingProviderSession');

  const courseIds = useMemo(() => orderData.items.map((item) => item.id), [orderData.items]);

  const handleProceedToPayment = () => {
    if (orderData.items.length === 0) {
      toast.error({ title: 'Your cart is empty' });
      return;
    }

    // If the order is already created, just redirect and prevent duplicate creation
    if (
      existingOrderId &&
      orderData.orderId === existingOrderId &&
      orderData.orderId &&
      !isCreatingOrder
    ) {
      router.push(`/payment?orderId=${orderData.orderId}`);
      return;
    }

    if (!orderState.matches('idle') && !orderState.matches('failure')) {
      return;
    }

    if (!courseIds.length) {
      toast.error({ title: 'No course(s) selected' });
      return;
    }

    orderService.send({ type: 'SELECT_PROVIDER', provider: selectedProvider });
    orderService.send({
      type: 'CREATE_ORDER',
      payload: {
        courseIds,
      },
    });
  };

  const canCheckout = orderData.items.length > 0 && !isCreatingOrder;

  if (orderData.items.length === 0 && !isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some courses to get started</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
            {checkoutType === 'course' && (
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} disabled={isPending}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            {checkoutType === 'course'
              ? 'Complete your course purchase'
              : 'Review your cart and proceed to payment'}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline">
            {orderData.items.length} {orderData.items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {orderData.items.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {course.title}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-accent hover:bg-primary/50 hover:text-white text-accent-foreground"
                  >
                    {course.level || 'All levels'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={course.thumbnail || '/placeholder-course.jpg'}
                    alt={course.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.instructor?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">₹{course.discountPrice?.toFixed(2)}</p>
                    {course.discountPrice && course.discountPrice < course.price && (
                      <p className="text-xs text-green-600">
                        Save ₹{(course.price - course.discountPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(course.id)}
                    disabled={isPending}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Coupon Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value }))}
                  disabled={isPending || couponForm.applied}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isPending || !couponForm.code.trim() || couponForm.applied}
                  variant="outline"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {couponForm.applied && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 mt-2 flex items-center gap-1"
                >
                  <Tag className="w-4 h-4" />
                  Coupon applied successfully! You saved ${couponForm.discount.toFixed(2)}
                </motion.p>
              )}
            </CardContent>
          </Card> */}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummaryCard
            isProcessing={isCreatingOrder}
            onCheckout={handleProceedToPayment}
            showCheckoutButton={canCheckout}
            summary={{
              currency: orderData.currency,
              discount: orderData.discount,
              subtotal: orderData.subtotal,
              tax: orderData.tax,
              total: orderData.total,
              itemCount: orderData.items.length,
            }}
          />
        </div>

        {/* <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{orderData.subtotal.toFixed(2)}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{orderData.discount.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{orderData.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedProvider}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium capitalize">{selectedProvider}</span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0"
                          onClick={() =>
                            setSelectedProvider((prev) =>
                              prev === 'stripe' ? 'razorpay' : 'stripe'
                            )
                          }
                        >
                          Switch
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full"
                size="lg"
                disabled={!canCheckout}
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating secure order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
