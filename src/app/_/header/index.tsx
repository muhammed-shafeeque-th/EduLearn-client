'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Heart, GraduationCap, Shield, BookOpen } from 'lucide-react';

import Logo from '../logo';
import { Button } from '@/components/ui/button';
import { SearchBar } from './components/search-bar';
// import { CategoriesDropdown } from './components/categories-dropdown';
import { MobileMenu } from './components/mobile-menu';
import { NotificationButton } from './components/notification-dropdown';
import CartButton from './components/cart-button';
import AuthButtons from './components/auth-buttons';
import { useAuthIsAuthenticated, useAuthSelector } from '@/states/client';

import { useGlobalErrorToast } from '@/hooks/use-global-error.toast';
import { getUserRole } from '@/lib/utils/user.utils';

const ThemeToggle = dynamic(
  () => import('../../../components/shared/theme-button').then((m) => m.ThemeToggle),
  { ssr: false }
);

const UserMenu = dynamic(() => import('./components/user-menu').then((m) => m.UserMenu), {
  ssr: false,
});

export default function Header() {
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
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation for authenticated users */}
          <nav
            className="hidden md:flex items-center space-x-6 flex-1 max-w-10xl"
            aria-label="Primary"
          >
            {/* <CategoriesDropdown /> */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" asChild>
                <Link href="/courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Courses</span>
                </Link>
              </Button>
            </motion.div>

            <SearchBar className="flex-1 max-w-2xl" />
            {isAuthenticated && (
              <>
                {/* Show Become Instructor for students only, Instructor button for instructors */}
                {userRole === 'student' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href="/become-instructor" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Teach on EduLearn</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
                {userRole === 'instructor' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href="/instructor" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Instructor</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
                {/* Admin dashboard button for admin users */}
                {userRole === 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </nav>

          {/* Right actions section */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                {/* Wishlist */}
                <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                {/* Cart */}
                <CartButton />
                {/* Notifications */}
                <NotificationButton />
                {/* User menu */}
                {user && <UserMenu user={user} />}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <AuthButtons isLoading={isLoading} />
              </div>
            )}

            {/* Mobile menu */}
            <MobileMenu user={user} isAuthLoading={isLoading} />
          </div>
        </div>

        {/* Mobile search bar */}
        {isAuthenticated && (
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        )}
      </div>
    </motion.header>
  );
}
