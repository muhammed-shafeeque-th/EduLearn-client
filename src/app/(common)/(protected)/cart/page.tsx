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
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<CartSkeleton />}>
          <CartClient />
        </Suspense>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </main>
  );
}
