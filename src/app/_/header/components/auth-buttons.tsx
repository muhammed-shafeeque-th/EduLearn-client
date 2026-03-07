'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type AuthButtonsProps = {
  isLoading: boolean;
};

const AuthButtons = React.memo(function AuthButtons({ isLoading }: AuthButtonsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-label="Authentication loading">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-label="Authentication actions">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button variant="ghost" asChild aria-label="Log in to your account">
          <Link href="/auth/login" prefetch={false}>
            Log In
          </Link>
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button className="dark:text-white" asChild aria-label="Sign up for an account">
          <Link href="/auth/register" prefetch={false}>
            Sign Up
          </Link>
        </Button>
      </motion.div>
    </div>
  );
});

AuthButtons.displayName = 'AuthButtons';

export default AuthButtons;
