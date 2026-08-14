'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Heart, GraduationCap, Shield, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthIsAuthenticated, useAuthSelector } from '@/states/client';

import { useGlobalErrorToast } from '@/hooks/use-global-error.toast';
import { getUserRole } from '@/lib/utils/user.utils';
import { ROUTES } from '@/lib/constants/routes';
import AuthButtons from './components/auth-buttons';
import { MobileMenu } from './components/mobile-menu';
import { SearchBar } from './components/search-bar';
import { Logo } from '@/components/ui/logo';

const ThemeToggle = dynamic(
  () => import('@/components/shared/theme-button').then((m) => m.ThemeToggle),
  { ssr: false }
);

const UserMenu = dynamic(() => import('./components/user-menu').then((m) => m.UserMenu), {
  ssr: false,
});

// Previously statically imported. Both only ever render behind
// `isAuthenticated`, so the conditional already stopped their *hooks* from
// running for anonymous visitors — but a static import still puts their
// code in the same chunk Header ships to everyone. Dynamic import means
// this code is only fetched at all once a user is actually logged in,
// which matters most here since (public) pages are exactly where
// anonymous/SEO traffic is heaviest.
const CartButton = dynamic(() => import('./components/cart-button'), { ssr: false });
const NotificationButton = dynamic(
  () => import('./components/notification-dropdown').then((m) => m.NotificationButton),
  { ssr: false }
);

export function SiteHeader() {
  const { user, isLoading } = useAuthSelector();
  const isAuthenticated = useAuthIsAuthenticated();
  const userRole = getUserRole(user);

  useGlobalErrorToast();

  return (
    <motion.header
      initial={false}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>

          <nav
            className="hidden md:flex items-center space-x-6 flex-1 max-w-10xl"
            aria-label="Primary"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" asChild>
                <Link href={ROUTES.public.courses.root} className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Courses</span>
                </Link>
              </Button>
            </motion.div>

            <SearchBar className="flex-1 max-w-2xl" />
            {isAuthenticated && (
              <>
                {userRole === 'student' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link
                        href={ROUTES.public.becomeInstructor.root}
                        className="flex items-center gap-2"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Teach on EduLearn</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
                {userRole === 'instructor' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href={ROUTES.instructor.root} className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Instructor</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
                {userRole === 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href={ROUTES.admin.root} className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
                  <Link href={ROUTES.student.wishlist}>
                    <Heart className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <CartButton />
                <NotificationButton />
                {user && <UserMenu user={user} />}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <AuthButtons isLoading={isLoading} />
              </div>
            )}

            <MobileMenu user={user} isAuthLoading={isLoading} />
          </div>
        </div>

        {isAuthenticated && (
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        )}
      </div>
    </motion.header>
  );
}
