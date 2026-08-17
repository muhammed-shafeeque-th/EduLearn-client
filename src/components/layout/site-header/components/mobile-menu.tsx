'use client';

import { useState, useEffect, FormEvent, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  GraduationCap,
  Heart,
  ShoppingCart,
  Bell,
  Shield,
  LogOut,
  type LucideIcon,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';

import { AuthUser } from '@/types/auth';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getUserRole } from '@/lib/utils/user.utils';

import { ROUTES } from '@/lib/constants/routes';
import { PUBLIC_NAV_LINKS } from '@/lib/constants/nav-links';

import AuthButtons from './auth-buttons';

interface MobileMenuProps {
  user?: AuthUser | null;
  isAuthLoading: boolean;
}

const LINK_TEXT_CLASSES = 'font-sans font-semibold text-base tracking-tight';

export function MobileMenu({ user, isAuthLoading }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { logout } = useAuth();

  const role = user ? getUserRole(user) : null;

  /**
   * Mount detection
   *
   * Required because createPortal(document.body) can only happen after the
   * component has mounted on the client.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Prevent body scrolling while the mobile menu is open
   */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /**
   * Logout
   */
  const handleLogout = useCallback(() => {
    setIsOpen(false);
    logout();
  }, [logout]);

  /**
   * Close menu
   */
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Search
   */
  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmed = searchQuery.trim();

      if (!trimmed) {
        return;
      }

      setIsOpen(false);

      router.push(`${ROUTES.public.courses.root}?search=${encodeURIComponent(trimmed)}`);
    },
    [router, searchQuery]
  );

  /**
   * Navigation link
   */
  const NavLink = useMemo(
    () =>
      function NavLink({
        href,
        icon: Icon,
        children,
        className,
      }: {
        href: string;
        icon: LucideIcon;
        children: React.ReactNode;
        className?: string;
      }) {
        return (
          <Link
            href={href}
            onClick={closeMenu}
            className={cn(
              'relative z-10 flex min-h-12 touch-manipulation items-center gap-3 rounded-xl p-3',
              'transition-colors duration-200',
              'hover:bg-muted',
              'active:scale-[0.98]',
              LINK_TEXT_CLASSES,
              className
            )}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-70" />
            <span className="min-w-0 truncate">{children}</span>
          </Link>
        );
      },
    [closeMenu]
  );

  /**
   * Mobile menu content
   */
  const menuContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 
              Backdrop
               */}
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* 
              Mobile Sheet
               */}
          <motion.aside
            key="mobile-menu-sheet"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className={cn(
              'fixed inset-y-0 right-0 z-[101]',
              'flex w-[300px] max-w-[85vw] flex-col',
              'border-l bg-background shadow-2xl',
              'md:hidden'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* 
                Header
                 */}
            <div
              className={cn(
                'relative z-10 flex shrink-0 items-center justify-between',
                'border-b bg-muted/20 p-5'
              )}
            >
              <Logo />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="touch-manipulation rounded-full hover:bg-muted"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 
                Scrollable content
                 */}
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5">
                {/* -----------------------------------------------------------
                    User / Authentication
                    ----------------------------------------------------------- */}
                {user ? (
                  <div className="mb-6">
                    <div
                      className={cn(
                        'flex items-center gap-4 rounded-2xl',
                        'border border-border/50 bg-muted/40 p-4'
                      )}
                    >
                      <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/10">
                        <AvatarImage src={user.avatar} alt={user.username} />

                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold leading-tight">
                          {user.username}
                        </p>

                        <p className="truncate text-xs text-muted-foreground opacity-80">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !isAuthLoading ? (
                  <div className="relative z-10 mb-8">
                    <p className="mb-4 px-1 text-sm text-muted-foreground">
                      Sign in to access your courses and more.
                    </p>

                    <AuthButtons isLoading={false} />
                  </div>
                ) : (
                  <div className="mb-8 space-y-3">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </div>
                )}

                {/* -----------------------------------------------------------
                    Search
                    ----------------------------------------------------------- */}
                <form onSubmit={handleSearchSubmit} className="relative z-10 mb-8">
                  <Search
                    className={cn(
                      'pointer-events-none absolute left-4 top-1/2',
                      'h-4 w-4 -translate-y-1/2',
                      'text-muted-foreground'
                    )}
                  />

                  <Input
                    type="search"
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className={cn(
                      'h-12 rounded-2xl border-none bg-muted/30',
                      'pl-11',
                      'focus-visible:ring-1 focus-visible:ring-primary/20',
                      'touch-manipulation'
                    )}
                    aria-label="Search courses"
                  />
                </form>

                {/* -----------------------------------------------------------
                    Navigation
                    ----------------------------------------------------------- */}
                <div className="space-y-8">
                  {/* =========================================================
                      Explore
                      ========================================================= */}
                  <section>
                    <h4
                      className={cn(
                        'mb-2 px-3',
                        'text-[11px] font-bold uppercase',
                        'tracking-widest text-muted-foreground/60'
                      )}
                    >
                      Explore
                    </h4>

                    <div className="space-y-1">
                      {PUBLIC_NAV_LINKS.map((link) => (
                        <NavLink key={link.href} href={link.href} icon={link.icon}>
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </section>

                  {/* =========================================================
                      Personal
                      ========================================================= */}
                  {user && (
                    <section>
                      <h4
                        className={cn(
                          'mb-2 px-3',
                          'text-[11px] font-bold uppercase',
                          'tracking-widest text-muted-foreground/60'
                        )}
                      >
                        Personal
                      </h4>

                      <div className="space-y-1">
                        <NavLink href={ROUTES.student.profile.root} icon={User}>
                          Profile
                        </NavLink>

                        <NavLink href={ROUTES.student.wishlist} icon={Heart}>
                          Saved Courses
                        </NavLink>

                        <NavLink href={ROUTES.student.cart} icon={ShoppingCart}>
                          Shopping Cart
                        </NavLink>

                        <NavLink href={ROUTES.student.notifications} icon={Bell}>
                          Notifications
                        </NavLink>
                      </div>
                    </section>
                  )}

                  {/* =========================================================
                      Management
                      ========================================================= */}
                  {user && (role === 'instructor' || role === 'admin' || role === 'student') && (
                    <section>
                      <h4
                        className={cn(
                          'mb-2 px-3',
                          'text-[11px] font-bold uppercase',
                          'tracking-widest text-muted-foreground/60'
                        )}
                      >
                        Management
                      </h4>

                      <div className="space-y-1">
                        {/* Instructor */}
                        {role === 'instructor' && (
                          <NavLink
                            href={ROUTES.instructor.root}
                            icon={GraduationCap}
                            className="text-primary"
                          >
                            Instructor Dashboard
                          </NavLink>
                        )}

                        {/* Admin */}
                        {role === 'admin' && (
                          <NavLink
                            href={ROUTES.admin.root}
                            icon={Shield}
                            className="text-destructive"
                          >
                            Admin Dashboard
                          </NavLink>
                        )}

                        {/* Student */}
                        {role === 'student' && (
                          <NavLink
                            href={ROUTES.public.becomeInstructor.root}
                            icon={GraduationCap}
                            className="text-primary"
                          >
                            Teach on EduLearn
                          </NavLink>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* 
                Footer / Logout
                 */}
            {user && (
              <div className={cn('relative z-10 shrink-0', 'border-t bg-muted/10 p-5')}>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    'h-12 w-full touch-manipulation',
                    'justify-start gap-3 rounded-xl',
                    'text-destructive',
                    'hover:bg-destructive/10',
                    'hover:text-destructive'
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sign Out
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  /**
   * Trigger + Portal
   */
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="touch-manipulation rounded-full hover:bg-muted md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {mounted && typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  );
}
