'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Notification, NotificationFilters } from '@/types/notification';
import { notificationService } from '@/services/notification.service';
import { useNotificationWebSocket } from './use-websocket';
import { config } from '@/lib/config';
import {
  useClearAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsList,
} from '@/states/server/notification/use-notifications';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useQueryClient } from '@tanstack/react-query';

export function useNotifications(filters: Partial<NotificationFilters> = {}) {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  // Initialize audio and request permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/new-notification.mp3');
      notificationService.requestNotificationPermission();
    }
  }, []);

  // Handle new notifications from WebSocket
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      // Prevent duplicate processing
      if (processedNotificationIds.current.has(notification.id)) {
        return;
      }
      processedNotificationIds.current.add(notification.id);

      // Update TanStack Query cache - add to all notification lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.notifications.lists() },
        (
          old:
            | {
                pages?: Array<{
                  notifications?: Notification[];
                  pagination?: unknown;
                  page?: number;
                }>;
              }
            | undefined
        ) => {
          if (!old?.pages) return old;

          // Check if notification already exists in any page
          const exists = old.pages.some((page) =>
            page.notifications?.some((n: Notification) => n.id === notification.id)
          );

          if (exists) return old;

          // Add notification to first page
          return {
            ...old,
            pages: old.pages.map((page, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  notifications: [notification, ...(page.notifications || [])],
                };
              }
              return page;
            }),
          };
        }
      );

      // Update unread count
      queryClient.setQueryData(QUERY_KEYS.notifications.unreadCount(), (old: number = 0) => {
        return old + 1;
      });

      // Play sound
      audioRef.current?.play().catch((err) => {
        console.debug('Audio play failed:', err);
      });

      // Show browser notification
      notificationService.showBrowserNotification(notification);

      // Show toast
      toast.info(notification.subject, {
        description: notification.message,
        action: notification.actionUrl
          ? {
              label: 'View',
              onClick: () => {
                window.location.href = notification.actionUrl!;
              },
            }
          : undefined,
        duration: 5000,
      });

      // Clean up processed IDs set periodically to prevent memory leaks
      if (processedNotificationIds.current.size > 1000) {
        processedNotificationIds.current.clear();
      }
    },
    [queryClient]
  );

  // Handle WebSocket errors
  const handleWebSocketError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    // Optionally show error toast for connection issues
    // toast.error('Notification connection error');
  }, []);

  // Setup WebSocket connection
  const { isConnected } = useNotificationWebSocket({
    url: config.notificationWsUrl,
    onNotification: handleNewNotification,
    onError: handleWebSocketError,
    config: {
      maxReconnectAttempts: 5,
      reconnectStrategy: 'exponential',
      enableMessageQueue: true,
    },
    onConnect() {
      console.log('Notification WebSocket connected');
      // Optionally refetch notifications on reconnect
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onDisconnect() {
      console.log('Notification WebSocket disconnected');
    },
  });

  const {
    notifications: queryNotifications,
    // unreadCount: queryUnreadCount,
    hasMore,
    isLoading,
    error,
    fetchNextPage,
    refetch,
  } = useNotificationsList(filters);

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();

  // Notifications are already merged in QueryClient cache by the provider
  // WebSocket updates are automatically synced to the cache
  const unreadCount = queryNotifications.filter((n) => !n.isRead).length;

  return {
    notifications: queryNotifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    hasMore,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    clearAll: clearAllMutation.mutateAsync,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
}
