'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  Search,
  BookOpen,
  GraduationCap,
  Heart,
  ShoppingCart,
  Bell,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '../../logo';
import AuthButtons from './auth-buttons';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { AuthUser } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface MobileMenuProps {
  user?: AuthUser | null;
  isAuthLoading: boolean;
}

const LINK_TEXT_CLASSES = 'font-sans font-semibold text-base tracking-tight';

export function MobileMenu({ user, isAuthLoading }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    logout();
  }, [logout]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setIsOpen(false);
    }
  };

  const NavLink = ({
    href,
    icon: Icon,
    children,
    className,
  }: {
    href: string;
    icon: LucideIcon;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-muted active:scale-[0.98]',
        LINK_TEXT_CLASSES,
        className
      )}
      onClick={() => setIsOpen(false)}
    >
      <Icon className="h-5 w-5 opacity-70" />
      <span>{children}</span>
    </Link>
  );

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with gradient blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile Menu - Modern Sheet Design */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[101] h-full w-[300px] max-w-[85vw] bg-background border-l shadow-2xl md:hidden flex flex-col"
          >
            {/* Header Area */}
            <div className="flex items-center justify-between p-5 border-b bg-muted/20">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* User Section - Premium Card Style */}
              <div className="p-5">
                {user ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 rounded-2xl bg-muted/40 p-4 border border-border/50">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base leading-tight truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate opacity-80">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !isAuthLoading ? (
                  <div className="mb-8 p-1">
                    <p className="text-sm text-muted-foreground mb-4 px-1">
                      Sign in to access your courses and more.
                    </p>
                    <AuthButtons isLoading={false} />
                  </div>
                ) : (
                  <div className="mb-8 space-y-3">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                )}

                {/* Quick Search */}
                <form onSubmit={handleSearchSubmit} className="mb-8 relative group">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="search"
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20"
                    aria-label="Search courses"
                  />
                </form>

                {/* Navigation Groups */}
                <div className="space-y-8">
                  {/* General Nav */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
                      Navigation
                    </h4>
                    <NavLink href="/courses" icon={BookOpen}>
                      Browse Courses
                    </NavLink>
                    {user && (
                      <NavLink href="/my-learning" icon={BookOpen}>
                        My Learning
                      </NavLink>
                    )}
                  </div>

                  {/* Personal Nav */}
                  {user && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
                        Personal
                      </h4>
                      <NavLink href="/wishlist" icon={Heart}>
                        Saved Courses
                      </NavLink>
                      <NavLink href="/cart" icon={ShoppingCart}>
                        Shopping Cart
                      </NavLink>
                      <NavLink href="/notifications" icon={Bell}>
                        Notifications
                      </NavLink>
                    </div>
                  )}

                  {/* Management Nav */}
                  {(user?.role === 'instructor' ||
                    user?.role === 'admin' ||
                    user?.role === 'student') && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">
                        Management
                      </h4>
                      {user?.role === 'instructor' && (
                        <NavLink href="/instructor" icon={GraduationCap} className="text-primary">
                          Instructor Dashboard
                        </NavLink>
                      )}
                      {user?.role === 'admin' && (
                        <NavLink href="/admin/dashboard" icon={Shield} className="text-destructive">
                          Admin Dashboard
                        </NavLink>
                      )}
                      {user?.role === 'student' && (
                        <NavLink
                          href="/become-instructor"
                          icon={GraduationCap}
                          className="text-primary"
                        >
                          Teach on EduLearn
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Logout */}
            {user && (
              <div className="p-5 border-t bg-muted/10">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <X className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-full hover:bg-muted"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>
      {mounted && typeof window !== 'undefined' ? createPortal(menuContent, document.body) : null}
    </>
  );
}
