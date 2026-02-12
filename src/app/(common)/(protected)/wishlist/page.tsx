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
    <div className="min-h-screen bg-background">
      <Suspense fallback={<WishlistSkeleton />}>
        <WishlistClient />
      </Suspense>
    </div>
  );
}
