'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

import { WishlistSkeleton } from './skeletons/wishlist-skeleton';
import { WishlistEmpty } from './wishlist-empty';
import { CourseCard } from './course-card';
import { useWishlist } from '@/states/server/wishlist/use-wishlists';

export function WishlistClient() {
  const { wishlist, isLoading, error } = useWishlist({ enabled: true });

  const wishlistTotal = Math.max(wishlist?.total ?? 0, wishlist?.items.length ?? 0);

  // Loading State: Show skeleton
  if (isLoading) {
    return <WishlistSkeleton />;
  }

  // Error State: Show error message
  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive" role="alert">
            Failed to load wishlist. Please try again.
          </p>
        </div>
      </section>
    );
  }

  // Empty State: Show Empty Wishlist component
  if (!wishlist || !Array.isArray(wishlist.items) || wishlist.items.length === 0) {
    return <WishlistEmpty />;
  }

  // Main content: Wishlist with items
  return (
    <section className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary fill-current" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-foreground">{`Wishlist (${wishlistTotal})`}</h1>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {wishlistTotal} course{wishlist.total === 1 ? '' : 's'} saved
          </div>
        </header>

        {/* Course Grid */}
        <section className="grid grid-cols-1 gap-6" aria-label="Wishlist Courses">
          <AnimatePresence mode="popLayout">
            {wishlist.items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  x: -100,
                  scale: 0.95,
                  transition: { duration: 0.3 },
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  layout: { duration: 0.3 },
                }}
              >
                <CourseCard course={item.course} wishlistId={wishlist.id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </motion.div>
    </section>
  );
}
