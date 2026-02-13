'use client';

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Notification } from '@/types/notification';
import { notificationService } from '@/services/notification.service';
import { useNotificationWebSocket } from '@/services/ws/notification/hooks/use-websocket';
import { config } from '@/lib/config';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

export interface NotificationContextType {
  notifications: Notification[];
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * NotificationProvider - Provides WebSocket notifications and syncs with TanStack Query
 *
 * Features:
 * - WebSocket connection management
 * - Real-time notification updates
 * - TanStack Query cache synchronization
 * - Audio/browser notification alerts
 * - Toast notifications
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
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

  // Get real-time notifications from WebSocket (stored in a lightweight state)
  // This is just for the context - actual data comes from TanStack Query
  const wsNotifications: Notification[] = [];

  const value: NotificationContextType = {
    notifications: wsNotifications, // WebSocket notifications (merged in hooks)
    isConnected,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * Hook to access notification context
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}
