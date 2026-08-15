import { Metadata } from 'next';
import { WishlistClient } from './_/components/wishlist-client';
import { Suspense } from 'react';
import { WishlistSkeleton } from './_/components/skeletons/wishlist-skeleton';

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'View and manage your saved courses',
};

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<WishlistSkeleton />}>
          <WishlistClient />
        </Suspense>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </main>
  );
}
