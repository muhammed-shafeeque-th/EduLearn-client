'use client';

import { CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Cart } from '@/types/cart';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useAuthIsAuthenticated, useAuthSelector } from '@/states/client';
import { ROUTES } from '@/lib/constants/routes';

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const isAuthenticated = useAuthIsAuthenticated();
  const { user } = useAuthSelector();

  const subtotal = cart.items.reduce((sum, item) => sum + item.course.discountPrice, 0);
  const originalTotal = cart.items.reduce(
    (sum, item) => sum + (item.course.price || item.course.discountPrice),
    0
  );
  const discount = originalTotal - subtotal;

  const hasOwnCourse =
    user && cart.items.some((item) => item.course.instructor?.id === user.userId);

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
        <p className="text-muted-foreground text-xs font-semibold uppercase">
          {cart.items.length} {cart.items.length === 1 ? 'Course' : 'Courses'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium text-sm">Subtotal</span>
          <span className="text-foreground font-bold">{formatPrice(originalTotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-500">
            <span className="font-medium text-sm">Discount</span>
            <span className="font-bold">-{formatPrice(discount)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <span className="text-foreground font-bold text-lg">Total</span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">
              Includes all taxes
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="space-y-3">
        {hasOwnCourse ? (
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              One or more courses in your cart are authored by you. Please remove them to proceed.
            </span>
          </div>
        ) : isAuthenticated ? (
          <Button size="lg" className="w-full h-12 rounded-xl font-bold text-sm" asChild>
            <Link href={ROUTES.student.checkout}>
              <CreditCard className="w-5 h-5 mr-2" />
              Checkout
            </Link>
          </Button>
        ) : (
          <Button
            size="lg"
            variant="default"
            className="w-full h-12 rounded-xl font-bold text-sm"
            asChild
          >
            <Link href={`${ROUTES.student.cart}?redirect=${ROUTES.student.cart}`}>
              <Lock className="w-4 h-4 mr-2" />
              Login to Checkout
            </Link>
          </Button>
        )}

        {/* <div className="flex flex-col items-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg">🔄</span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground text-center">
                Money Back
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">♾️</span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground text-center">
                Lifetime Access
              </span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
