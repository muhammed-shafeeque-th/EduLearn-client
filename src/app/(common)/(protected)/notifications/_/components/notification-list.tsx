'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './notification-item';
import { Notification, NotificationFilter, NotificationType } from '@/types/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/services/ws/notification/hooks/use-notifications';
import { NotificationFilters } from './notification-filters';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  initialData: Notification[];
}

export function NotificationList({ initialData }: NotificationListProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAllAsRead,
    // clearAll,
    loadMore,
    refresh,
  } = useNotifications(filter !== 'all' ? { isRead: filter === 'read' } : {});
  // Use initial data until notifications are loaded
  const displayNotifications = notifications.length > 0 ? notifications : initialData;

  const filteredNotifications = displayNotifications.filter((n) => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (typeFilter !== 'all' && n.category !== typeFilter) return false;
    return true;
  });

  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      await loadMore();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Actions - Glassmorphism */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-[32px] sticky top-24 z-30 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Pill Filters */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              {(['all', 'unread', 'read'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    'px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 relative capitalize',
                    filter === tab
                      ? 'text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  )}
                >
                  {filter === tab && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-blue-600 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab}
                    {tab === 'all' && displayNotifications.length > 0 && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-md',
                          filter === tab
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        )}
                      >
                        {displayNotifications.length}
                      </span>
                    )}
                    {tab === 'unread' && unreadCount > 0 && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-md',
                          filter === tab
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        )}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-11 px-5 rounded-2xl border-slate-200 dark:border-slate-800 font-bold',
                showFilters && 'bg-slate-100 dark:bg-slate-800'
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refresh()}
              disabled={isLoading}
              className="h-11 w-11 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className={cn('h-4 w-4 text-slate-500', isLoading && 'animate-spin')} />
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                onClick={() => markAllAsRead()}
                className="h-11 px-6 rounded-2xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Type Filters Dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <NotificationFilters typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[32px] text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-x-0 bottom-0 h-4 bg-blue-500/10 blur-xl rounded-full" />
              <div className="relative bg-linear-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <Bell className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              All caught up!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-[280px] font-medium leading-relaxed">
              {filter !== 'all'
                ? `You don't have any ${filter} notifications at the moment.`
                : "No new activity found. We'll let you know when something happens!"}
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-xl border-slate-200 dark:border-slate-800 font-bold px-8 h-12 hover:bg-slate-50"
              onClick={() => refresh()}
            >
              Refresh Log
            </Button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
