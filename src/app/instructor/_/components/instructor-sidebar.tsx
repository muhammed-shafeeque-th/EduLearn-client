'use client';

import { useState, Fragment, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  Plus,
  Eye,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MessageCircleMore,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Logo from './logo';

// Sidebar navigation items
const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/instructor',
    icon: LayoutDashboard,
  },
  {
    title: 'Courses',
    href: '/instructor/courses',
    icon: BookOpen,
    badge: '12',
    children: [
      {
        title: 'All Courses',
        href: '/instructor/courses',
        icon: Eye,
      },
      {
        title: 'Create Course',
        href: '/instructor/courses/create',
        icon: Plus,
      },
    ],
  },
  {
    title: 'Chats',
    href: '/instructor/chats',
    icon: MessageCircleMore,
  },
  {
    title: 'Earnings',
    href: '/instructor/revenue',
    icon: DollarSign,
  },
];

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavigationItem[];
}
interface SidebarNavProps {
  items: NavigationItem[];
  pathname: string;
  expandedItems: Set<string>;
  toggleExpanded: (title: string) => void;
  onNavigate?: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  pathname,
  expandedItems,
  toggleExpanded,
  onNavigate,
}) => (
  <nav className="px-4 space-y-2 flex-1" aria-label="Sidebar primary">
    {items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
      const isExpanded = expandedItems.has(item.title);
      const hasChildren = !!item.children && item.children.length > 0;
      return (
        <Fragment key={item.title}>
          {hasChildren ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={`sidebar-sub-${item.title}`}
              onClick={() => toggleExpanded(item.title)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary dark:bg-primary dark:text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" aria-hidden />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="outline" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" aria-hidden />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden />
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary/90 dark:bg-primary dark:text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              onClick={onNavigate}
              tabIndex={0}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" aria-hidden />
                <span>{item.title}</span>
              </div>
              {item.badge && <Badge variant="outline">{item.badge}</Badge>}
            </Link>
          )}
          {/* Sub-navigation for children */}
          <AnimatePresence>
            {hasChildren && isExpanded && (
              <motion.div
                id={`sidebar-sub-${item.title}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.17 }}
                className="ml-4 mt-1 space-y-1"
              >
                {item.children?.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors',
                        isChildActive
                          ? 'bg-primary/15 text-primary/90 dark:bg-primary dark:text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                      onClick={onNavigate}
                      tabIndex={0}
                      aria-current={isChildActive ? 'page' : undefined}
                    >
                      <child.icon className="w-4 h-4" aria-hidden />
                      <span>{child.title}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </Fragment>
      );
    })}
  </nav>
);

export function InstructorSidebar() {
  const pathname = usePathname();

  // Use useCallback to prevent unnecessary re-renders
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(['Courses']));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Memoize navigation items
  const navigationItems = useMemo(() => NAV_ITEMS, []);
  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  // Handles closing sidebar on mobile nav-click for better UX.
  const handleNavClick = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" aria-hidden />
          ) : (
            <Menu className="w-6 h-6" aria-hidden />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleNavClick}
            aria-label="Sidebar overlay"
            tabIndex={-1}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <motion.aside
            key="sidebar-mobile"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed top-0 left-0 z-50 w-64 h-screen bg-card border-r border-border md:hidden flex flex-col'
            )}
            aria-label="Sidebar Navigation"
            tabIndex={-1}
          >
            <div className="p-6 flex items-center">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={handleNavClick}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" aria-hidden />
              </Button>
            </div>
            {/* Navigation fills the vertical space between header and quickstart */}
            <div className="flex-1 flex flex-col min-h-0">
              <SidebarNav
                items={navigationItems}
                pathname={pathname}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                onNavigate={handleNavClick}
              />
              <SidebarQuickStart onClick={handleNavClick} />
            </div>
          </motion.aside>
        )}

        {/* Desktop sidebar */}
        <motion.aside
          key="sidebar-desktop"
          initial={false}
          animate={false}
          className={cn(
            'hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0'
          )}
          aria-label="Sidebar Navigation"
        >
          <div className="p-6">
            <Logo />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <SidebarNav
              items={navigationItems}
              pathname={pathname}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
            <SidebarQuickStart />
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
}

interface QuickStartProps {
  onClick?: () => void;
}
// The Quick Start component is always pinned at the bottom due to surrounding flex container
const SidebarQuickStart: React.FC<QuickStartProps> = ({ onClick }) => (
  <div className="mt-auto p-4">
    <div className="bg-gradient-to-r from-primary to-blue-500 rounded-lg p-4 text-white">
      <h3 className="font-semibold mb-2">Quick Start</h3>
      <p className="text-sm text-white/80 mb-3">Create your first course and start teaching</p>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="w-full dark:bg-white dart:hover:text-white text-primary"
        onClick={onClick}
      >
        <Link href="/instructor/courses/create" className="dark:text-primary">
          <Plus className="w-4 h-4 mr-2" aria-hidden />
          Create Course
        </Link>
      </Button>
    </div>
  </div>
);
