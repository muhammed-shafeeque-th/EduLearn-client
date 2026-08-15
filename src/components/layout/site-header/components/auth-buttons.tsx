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

const MotionButton = motion(Button);

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
      <MotionButton
        variant="ghost"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        asChild
      >
        <Link href={ROUTES.auth.login}>Log In</Link>
      </MotionButton>

      <MotionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="dark:text-white"
        asChild
      >
        <Link href={ROUTES.auth.register}>Sign Up</Link>
      </MotionButton>
    </div>
  );
});

AuthButtons.displayName = 'AuthButtons';

export default AuthButtons;
