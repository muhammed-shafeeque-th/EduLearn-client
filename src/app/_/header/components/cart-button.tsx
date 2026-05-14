'use client';

import React, { memo, useState, useRef } from 'react';
import { Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/states/server/cart/use-cart';
import { useAuthSelector } from '@/states/client';
import { toast } from '@/hooks/use-toast';

const CartButton = memo(function CartButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = React.useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { user } = useAuthSelector();
  const {
    cart,
    isLoading: isCartLoading,
    removeFromCart,
    removeError,
    isRemoving,
  } = useCart({ enabled: !!user });

  const cartItems = cart?.items || [];
  const itemCount = cart?.total || 0;

  const totalPrice =
    cartItems?.reduce((sum, item) => sum + (item.course?.discountPrice ?? 0), 0) ?? 0;

  const handleRemove = async (courseId: string) => {
    await removeFromCart({ courseId });
    if (removeError) {
      toast.error({
        title: 'Something went wrong',
        description: removeError.message,
      });
    } else {
      toast.success({
        title: 'Operation successful',
        description: 'Item removed from cart',
      });
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Cart"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {mounted && !!itemCount && itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
              aria-label={`${itemCount} items in cart`}
            >
              {itemCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        align="end"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          <h3 className="font-semibold">Shopping Cart</h3>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {itemCount === 0 && cartItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Your cart is empty</div>
          ) : (
            <ul className="space-y-2 p-2">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted group transition"
                >
                  <Image
                    src={item.course?.thumbnail}
                    alt={item.course?.title || 'Course thumbnail'}
                    height={48}
                    width={64}
                    className="h-12 w-16 rounded bg-muted shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.course?.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.course?.instructor?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-sm">₹{item.course?.discountPrice}</span>
                      {item.course?.price && item.course?.price !== item.course?.discountPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{item.course?.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isRemoving || isCartLoading}
                    className="h-6 w-6 transition-transform duration-150 hover:scale-110"
                    onClick={() => handleRemove(item.courseId)}
                    aria-label="Remove item from cart"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full" aria-label="Go to cart page">
            <Link href="/cart">Go to Cart</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CartButton.displayName = 'CartButton';

export default CartButton;
