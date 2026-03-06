'use client';

import { useEffect, useMemo, useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { OrderSummaryCard } from './order-summary';
import { CheckoutSkeleton } from '../../loading';

interface CheckoutContentProps {
  existingOrderId?: string;
  courseId?: string;
  checkoutType: 'course' | 'cart';
}

const DEFAULT_PROVIDER: PaymentProvider = 'stripe';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function CheckoutContent({ existingOrderId, courseId, checkoutType }: CheckoutContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { data: courseRes, isLoading: isLoadingCourse } = useCourseById(courseId!, {
    enabled: !!courseId && checkoutType === 'course',
  });
  const { cart, removeFromCart, clearCart, isLoading: isLoadingCart } = useCart({ enabled: true });

  const {
    order,
    provider,
    machineError,
    status,
    isIdle,
    isOrderCreated,
    isCreatingOrder: isMachineCreatingOrder,
    isCreatingSession: isMachineCreatingSession,
    isFailed,
    selectProvider,
    createOrder,
    hydrate: hydrateOrder,
  } = useOrderMachine();

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(DEFAULT_PROVIDER);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);
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
    return { subtotal, discount, total };
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

  // Sync provider with selectedProvider
  useEffect(() => {
    if (!['idle', 'orderCreated', 'failure'].includes(status)) {
      return;
    }

    if (selectedProvider && selectedProvider !== provider) {
      selectProvider(selectedProvider);
    }
  }, [selectedProvider, provider, selectProvider, status]);

  // Handle successful order creation and redirect
  useEffect(() => {
    if (isOrderCreated && order?.id && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      setOrderData((prev) => {
        if (prev.orderId === order.id) return prev;
        return {
          ...prev,
          orderId: order.id,
          subtotal: normalizeCurrencyAmount(order.subTotal),
          total: normalizeCurrencyAmount(order.totalAmount),
          discount: normalizeCurrencyAmount(order.discount),
          tax: normalizeCurrencyAmount(order.salesTax),
          currency: order.currency,
        };
      });

      if (checkoutType === 'cart' && cart?.id && !hasClearedCartRef.current) {
        clearCart().catch(console.error);
        hasClearedCartRef.current = true;
      }

      setTimeout(() => {
        router.push(`/payment?orderId=${order.id}`);
      }, 0);
    }

    if (!isOrderCreated && hasRedirectedRef.current) {
      hasRedirectedRef.current = false;
      hasClearedCartRef.current = false;
    }
  }, [
    isOrderCreated,
    order?.id,
    order?.subTotal,
    order?.totalAmount,
    order?.discount,
    order?.salesTax,
    order?.currency,
    router,
    checkoutType,
    cart?.id,
    clearCart,
  ]);

  // Toast for machine errors
  useEffect(() => {
    if (isFailed && machineError) {
      toast.error({ title: machineError });
    }
  }, [isFailed, machineError]);

  // Initialization logic
  useEffect(() => {
    if (hasInitializedRef.current) return;
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
            items: result.data.items.map((item: { course: CourseInfo }) => item.course),
            orderId: result.data.id,
            subtotal: normalizeCurrencyAmount(result.data.subTotal),
            total: normalizeCurrencyAmount(result.data.totalAmount),
          }));

          hydrateOrder(
            result.data,
            (result.data.paymentDetails?.provider as PaymentProvider | undefined) ??
              DEFAULT_PROVIDER
          );

          if (result.data.paymentDetails?.provider) {
            setSelectedProvider(result.data.paymentDetails.provider as PaymentProvider);
          }
        }
        setIsInitializing(false);
        hasInitializedRef.current = true;
      });
    } else {
      // For "Buy Now" (single course) or "Cart Checkout"
      if (checkoutType === 'course') {
        if (!isLoadingCourse) {
          if (courseRes) {
            const items = [courseRes as CourseInfo];
            const figures = computeOrderFigures(items);
            setOrderData((prev) => ({
              ...prev,
              items,
              subtotal: figures.subtotal,
              total: figures.total,
              discount: figures.discount,
            }));
            setIsInitializing(false);
            hasInitializedRef.current = true;
          }
        }
      } else {
        // Cart type
        if (!isLoadingCart) {
          const items = cart?.items.map((item) => item.course as CourseInfo) || [];
          const figures = computeOrderFigures(items);
          setOrderData((prev) => ({
            ...prev,
            items,
            subtotal: figures.subtotal,
            total: figures.total,
            discount: figures.discount,
          }));
          setIsInitializing(false);
          hasInitializedRef.current = true;
        }
      }
    }
    return () => {
      ignore = true;
    };
  }, [
    existingOrderId,
    courseRes,
    cart?.items,
    checkoutType,
    hydrateOrder,
    isLoadingCourse,
    isLoadingCart,
  ]);

  const handleRemoveItem = async (itemId: string) => {
    const newItems = orderData.items.filter((item: CourseInfo) => item.id !== itemId);
    const figures = computeOrderFigures(newItems);

    setOrderData((prev: typeof orderData) => ({
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

  const isCreatingOrder = isPending || isMachineCreatingOrder || isMachineCreatingSession;
  const courseIds = useMemo(() => orderData.items.map((item) => item.id), [orderData.items]);

  const handleProceedToPayment = () => {
    if (orderData.items.length === 0) {
      toast.error({ title: 'Your cart is empty' });
      return;
    }

    if (
      existingOrderId &&
      orderData.orderId === existingOrderId &&
      orderData.orderId &&
      !isCreatingOrder
    ) {
      router.push(`/payment?orderId=${orderData.orderId}`);
      return;
    }

    if (!isIdle && !isFailed) {
      return;
    }

    if (!courseIds.length) {
      toast.error({ title: 'No course(s) selected' });
      return;
    }

    selectProvider(selectedProvider);
    createOrder({ courseIds });
  };

  const canCheckout = orderData.items.length > 0 && !isCreatingOrder;

  // Show skeleton during initial load
  if (isInitializing) {
    return <CheckoutSkeleton />;
  }

  // Show empty state if no items
  if (orderData.items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-primary/40" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Looks like you haven&apos;t added any courses yet. Explore our catalog to find your next
            learning adventure!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="px-8 shadow-md" onClick={() => router.push('/courses')}>
              Browse Courses
            </Button>
            {checkoutType === 'course' && (
              <Button variant="ghost" size="lg" onClick={() => router.back()}>
                Go Back
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <button
              className="flex items-center gap-2 text-primary font-medium text-sm hover:underline cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Review Order</h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {checkoutType === 'course'
                ? 'Check the details of your course purchase before proceeding.'
                : 'Confirm your items and amount to finalize your purchase.'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold">Secure Checkout</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Item list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors">
                {orderData.items.length} {orderData.items.length === 1 ? 'Course' : 'Courses'}
              </Badge>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {orderData.items.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <Card className="overflow-hidden border border-border rounded-xl hover:shadow-md transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Course image */}
                          <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden bg-muted">
                            <Image
                              src={course.thumbnail || '/placeholder-course.jpg'}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight">
                                  {course.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium">
                                  By {course.instructor?.name}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg"
                                onClick={() => handleRemoveItem(course.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold">
                                  {course.rating.toFixed(1)}
                                </span>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  {course.discountPrice < course.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ₹{course.price.toFixed(0)}
                                    </span>
                                  )}
                                  <span className="text-lg font-bold text-primary">
                                    ₹{course.discountPrice.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Loyalty/Coupon Info placeholder */}
            {/* <motion.div
              variants={itemVariants}
              className="bg-primary/5 rounded-xl p-6 border flex items-start gap-4"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base text-foreground mb-1">Applying Promo Codes</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Promo codes can be applied in the next step during payment resolution. Valid
                  discounts will be automatically subtracted from your final total.
                </p>
              </div>
            </motion.div> */}
          </div>

          {/* Sidebar / Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
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

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/40 text-xs text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p>
                  Every course comes with a <strong>30-day money-back guarantee</strong>. No
                  questions asked if you&apos;re not satisfied.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
