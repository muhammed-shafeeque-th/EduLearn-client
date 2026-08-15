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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">My Wishlist</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4" />
            <p className="text-base">
              You have {wishlistTotal} {wishlistTotal === 1 ? 'course' : 'courses'} saved for later.
            </p>
          </div>
        </header>

        {/* Course Grid */}
        <section className="grid grid-cols-1 gap-8" aria-label="Wishlist Courses">
          <AnimatePresence mode="popLayout">
            {wishlist.items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
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
    </div>
  );
}
