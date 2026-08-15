'use client';

import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from './cart-item';
import { CartEmpty } from './cart-empty';
import { CartSummary } from './cart-summary';
import { CartSkeleton } from './skeletons/cart-skeleton';
import { useCart } from '@/states/server/cart/use-cart';

export function CartClient() {
  const { cart, isLoading, isRemoving, removeFromCart } = useCart({ enabled: true });

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
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
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">Shopping Cart</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingCart className="w-4 h-4" />
            <p className="text-base">
              You have {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your
              cart.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CartItem
                  item={item}
                  onRemove={() => removeFromCart({ courseId: item.courseId })}
                  isRemoving={isRemoving}
                />
              </motion.div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <CartSummary cart={cart} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
