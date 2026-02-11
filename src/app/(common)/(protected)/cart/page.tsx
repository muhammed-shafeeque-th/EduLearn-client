import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CartSkeleton } from './_/components/skeletons/cart-skeleton';
import { CartClient } from './_/components/cart-client';

export const metadata: Metadata = {
  title: 'Shopping Cart | EduLearn',
  description: 'Review and manage your selected courses',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<CartSkeleton />}>
        <CartClient />
      </Suspense>
    </main>
  );
}
