'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from './notification-item';
import { Notification, NotificationFilter, NotificationType } from '@/types/notification';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/services/ws/notification/hooks/use-notifications';
import { NotificationFilters } from './notification-filters';

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
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as NotificationFilter)}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  {displayNotifications.length > 0 && (
                    <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                      {displayNotifications.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}

            {/* {displayNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAll()}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )} */}
          </div>
        </div>

        {/* Type Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <NotificationFilters typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {filter !== 'all'
                  ? `You don't have any ${filter} notifications`
                  : "You're all caught up!"}
              </p>
            </div>
          </Card>
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
