'use client';

import { CreditCard, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Cart } from '@/types/cart';
import Link from 'next/link';
import { User } from '@/types/user';
import { formatPrice } from '@/lib/utils';
import { useAuthSelector } from '@/store';

interface CartSummaryProps {
  cart: Cart;
  user: User | null;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const { isAuthenticated } = useAuthSelector();

  const subtotal = cart.items.reduce((sum, item) => sum + item.course.discountPrice, 0);
  const originalTotal = cart.items.reduce(
    (sum, item) => sum + (item.course.price || item.course.discountPrice),
    0
  );
  const discount = originalTotal - subtotal;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(originalTotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="space-y-3">
          {isAuthenticated ? (
            <Button size="lg" className="w-full bg-primary/90 hover:bg-primary text-white" asChild>
              <Link href="/checkout">
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full bg-primary/90 hover:bg-primary text-white" asChild>
              <Link href="/login?redirect=/cart">
                <Lock className="w-5 h-5 mr-2" />
                Login to Checkout
              </Link>
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            30-day money-back guarantee • Lifetime access
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
