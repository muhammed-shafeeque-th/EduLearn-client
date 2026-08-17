'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants/routes';

type AuthButtonsProps = {
  isLoading: boolean;
};

function AuthButtons({ isLoading }: AuthButtonsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-label="Authentication loading">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex items-center gap-2" aria-label="Authentication actions">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
      >
        <Button variant="ghost" asChild>
          <Link href={ROUTES.auth.login} className="touch-manipulation">
            Log In
          </Link>
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
      >
        <Button asChild className="dark:text-white">
          <Link href={ROUTES.auth.register} className="touch-manipulation">
            Sign Up
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}

export default AuthButtons;
