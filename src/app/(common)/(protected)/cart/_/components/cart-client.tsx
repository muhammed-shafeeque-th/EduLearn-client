'use client';

import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from './cart-item';
import { CartEmpty } from './cart-empty';
import { CartSummary } from './cart-summary';
import { CartSkeleton } from './skeletons/cart-skeleton';
// import { useAddToWishlist } from '@/hooks/wishlist/use-wishlists';
import { useCart, useRemoveFromCart } from '@/hooks/cart/use-cart';
import { User } from '@/types/user';

interface CartClientProps {
  user: User | null;
}

export function CartClient({ user }: CartClientProps) {
  // const { cart, isLoading, removeFromCart, clearCart, isRemoving } = useCart(user);
  const { data: cartRes, isLoading } = useCart({ enabled: true });
  const { cart } = cartRes ?? {};
  // const { mutateAsync: addToWishlist, isPending } = useAddToWishlist();
  const { mutateAsync: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  // const clearCart = () => {};

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Shopping Cart ({cart.items.length})
            </h1>
          </div>

          {/* {cart.items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearCart()}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )} */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
          <div className="lg:col-span-1">
            <CartSummary cart={cart} user={user} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
