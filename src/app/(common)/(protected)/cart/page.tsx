import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CartContent } from './_/components/cart-content';
import { CartSkeleton } from './_/components/skeletons/cart-skeleton';

export const metadata: Metadata = {
  title: 'Shopping Cart | EduLearn',
  description: 'Review and manage your selected courses',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </main>
  );
}
