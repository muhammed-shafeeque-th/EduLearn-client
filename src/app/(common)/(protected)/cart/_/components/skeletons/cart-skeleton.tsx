import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-muted-foreground animate-pulse" />
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>

        {/* Cart Summary Skeleton */}
        <div className="lg:col-span-1">
          <CartSummarySkeleton />
        </div>
      </div>
    </div>
  );
}

function CartItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-32 sm:h-36 bg-muted animate-pulse" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-5 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CartSummarySkeleton() {
  return (
    <Card className="sticky top-8">
      <div className="p-6 space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />

        {/* Coupon section */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="h-px bg-muted" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-14 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-px bg-muted" />
          <div className="flex justify-between">
            <div className="h-6 w-10 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Checkout button */}
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-3 w-48 bg-muted rounded animate-pulse mx-auto" />
      </div>
    </Card>
  );
}
