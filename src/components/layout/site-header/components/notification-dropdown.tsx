'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/services/ws/notification/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ROUTES } from '@/lib/constants/routes';

// Keeps dropdown item count consistent and maintainable
const DROPDOWN_MAX_ITEMS = 5;

const getNotificationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    course: '📚',
    assignment: '📝',
    achievement: '🏆',
    system: '⚙️',
    message: '💬',
  };
  return icons[type] || '🔔';
};

export function NotificationButton() {
  const { notifications, unreadCount, isConnected, markAsRead, deleteNotification } =
    useNotifications({ pageSize: DROPDOWN_MAX_ITEMS });
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const displayNotifications = useMemo(
    () => notifications.slice(0, DROPDOWN_MAX_ITEMS),
    [notifications]
  );

  // Memoize event handlers for best practice and performance
  const handleMarkAsRead = useCallback(
    async (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await markAsRead(id);
      } catch (error) {
        // Real app: Consider user feedback here

        console.error('Failed to mark as read:', error);
      }
    },
    [markAsRead]
  );

  const handleDelete = useCallback(
    async (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await deleteNotification(id);
      } catch (error) {
        // Real app: Consider user feedback here
        console.error('Failed to delete:', error);
      }
    },
    [deleteNotification]
  );

  const handleDropdownItemClick = useCallback(
    async (notification: (typeof notifications)[number]) => {
      if (!notification.isRead) await markAsRead(notification.id);
      if (notification.actionUrl) window.location.href = notification.actionUrl;
    },
    [markAsRead]
  );

  // Hover handlers for button and dropdown content
  const handleOpen = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  const handleClose = () => {
    // Give short delay to allow hover transition between button and menu panel without closing
    closeTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 80);
  };

  const handleContentEnter = () => {
    // Menu content is hovered: keep it open
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  const handleContentLeave = () => {
    // Menu content mouse leaves: close menu (with delay for user experience)
    closeTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 70);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* 
        Button acts as a hover target.
        Open dropdown on mouse enter, close on mouse leave.
      */}
      <DropdownMenuTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
          aria-haspopup="menu"
          aria-expanded={open}
          // Open on hover, close on leave
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {/* Connection indicator */}
          {mounted && (
            <>
              <span
                className={cn(
                  'absolute top-1 right-1 h-2 w-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                )}
                title={isConnected ? 'Connected' : 'Disconnected'}
                aria-label={
                  isConnected ? 'Connected to notifications' : 'Not connected to notifications'
                }
                role="status"
              />
              {/* Unread badge */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white"
                    aria-label={`${unreadCount} unread notifications`}
                    role="status"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={contentRef}
        className="w-96"
        align="end"
        sideOffset={8}
        aria-label="Notifications menu"
        // For closing menu on mouse leave, opening on mouse enter
        onMouseEnter={handleContentEnter}
        onMouseLeave={handleContentLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <Link href={ROUTES.student.notifications} passHref legacyBehavior>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              aria-label="View all notifications"
            >
              {/* Only ONE direct child for asChild */}
              <span className="flex items-center">
                View All
                <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
              </span>
            </Button>
          </Link>
        </div>

        <DropdownMenuSeparator />

        {/* Notifications list */}
        <ScrollArea className="h-[400px]">
          {displayNotifications.length === 0 ? (
            <div className="p-8 text-center" aria-live="polite">
              <Bell
                className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              {displayNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-4 cursor-pointer',
                    !notification.isRead && 'bg-primary/5'
                  )}
                  onClick={() => handleDropdownItemClick(notification)}
                  aria-label={`${notification.subject}${notification.isRead ? '' : ', unread'}`}
                  tabIndex={0}
                  asChild={false}
                >
                  {/* Icon */}
                  <div className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm leading-tight">{notification.subject}</p>
                      {!notification.isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground" aria-label="Time">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            title="Mark as read"
                            tabIndex={0}
                            aria-label={`Mark "${notification.subject}" as read`}
                          >
                            <Check className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(e, notification.id)}
                          title="Delete"
                          tabIndex={0}
                          aria-label={`Delete notification "${notification.subject}"`}
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > DROPDOWN_MAX_ITEMS && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href={ROUTES.student.notifications} passHref legacyBehavior>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  aria-label="Show all notifications"
                >
                  {/* Only ONE direct child for asChild */}
                  <span>View all {notifications.length} notifications</span>
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
