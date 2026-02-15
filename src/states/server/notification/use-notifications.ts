/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationFilters } from '@/types/notification';
import { useAuthUserSelector } from '@/states/client';
// import { useNotificationContext } from '@/app/(common)/(protected)/notifications/_/__provider';

/**
 * Hook to fetch notifications list with infinite scrolling support
 */
export function useNotifications(filters: Partial<NotificationFilters> = {}) {
  const pageSize = filters.pageSize || 20;

  const authUser = useAuthUserSelector();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.notifications.list(authUser?.userId || 'current', filters),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await notificationService.getNotifications(
        {
          ...filters,
          page: pageParam,
          pageSize,
        },
        { signal }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch notifications');
      }

      return {
        notifications: response.data,
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined;
    },
    staleTime: 30 * 1000, // 30 seconds - notifications are real-time
    gcTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load notifications',
    },
  });
}

/**
 * Hook to get flattened notifications array from infinite query
 */
export function useNotificationsList(filters: Partial<NotificationFilters> = {}) {
  const query = useNotifications(filters);

  const notifications = query.data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasMore = query.hasNextPage ?? false;

  return {
    ...query,
    notifications,
    unreadCount,
    hasMore,
  };
}

/**
 * Hook to get unread count (optimized query)
 */
export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount(),
    queryFn: async ({ signal }) => {
      const response = await notificationService.getNotifications(
        {
          page: 1,
          pageSize: 1,
          isRead: false,
        },
        { signal }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch unread count');
      }

      // Return total from pagination if available, otherwise count from data
      return response.pagination?.total ?? response.data.length;
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    meta: {
      errorMessage: 'Failed to load unread count',
    },
  });
}

/**
 * Hook to get a single notification
 */
export function useNotification(id: string, options?: { enabled?: boolean }) {
  const authUser = useAuthUserSelector();
  return useQuery({
    queryKey: QUERY_KEYS.notifications.detail(authUser?.userId || 'current', id),
    queryFn: async ({ signal }) => {
      const response = await notificationService.getNotification(id, { signal });
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch notification');
      }
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to load notification',
    },
  });
}

/**
 * Mutation to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const authUser = useAuthUserSelector();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationService.markAsRead(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark as read');
      }
      return id;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });

      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications.all,
      });

      // Optimistically update all notification lists
      queryClient.setQueriesData<{ notifications: Notification[] }>(
        { queryKey: QUERY_KEYS.notifications.list(authUser?.userId || 'current', {}) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications?.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          };
        }
      );

      // Update infinite query pages
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.notifications.lists() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: (page.notifications || [])?.map((n: Notification) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          })),
        };
      });

      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark notification as read');
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

/**
 * Mutation to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationService.markAllAsRead();
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark all as read');
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });

      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications.all,
      });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.notifications.lists() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: (page.notifications || [])?.map((n: Notification) => ({
              ...n,
              isRead: true,
            })),
          })),
        };
      });

      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark all notifications as read');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

/**
 * Mutation to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  const authUser = useAuthUserSelector();

  return useMutation({
    mutationFn: async (id: string) => {
      await notificationService.deleteNotification(id);
      // if (!response.success) {
      //   throw new Error(response.message || 'Failed to delete notification');
      // }
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });

      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications.all,
      });

      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.notifications.lists() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: (page.notifications || []).filter((n: Notification) => n.id !== id),
          })),
        };
      });

      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.notifications.detail(authUser?.userId || 'current', id),
      });

      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete notification');
    },
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

/**
 * Mutation to clear all notifications
 */
export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationService.clearAll();
      if (!response.success) {
        throw new Error(response.message || 'Failed to clear notifications');
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });

      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications.all,
      });

      // Optimistically clear all
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.notifications.lists() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: [
            {
              notifications: [],
              pagination: { hasNext: false, hasPrev: false, page: 1, total: 0 },
              page: 1,
            },
          ],
        };
      });

      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to clear notifications');
    },
    onSuccess: () => {
      toast.success('All notifications cleared');
      queryClient.setQueryData(QUERY_KEYS.notifications.unreadCount(), 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

/**
 * Main hook that combines queries, mutations, and WebSocket state
 * This is the primary hook to use in components
 */
//  function useNotificationsWithActions(filters: Partial<NotificationFilters> = {}) {
//   const { isConnected } = useNotificationContext();

//   const {
//     notifications: queryNotifications,
//     // unreadCount: queryUnreadCount,
//     hasMore,
//     isLoading,
//     error,
//     fetchNextPage,
//     refetch,
//   } = useNotificationsList(filters);

//   const markAsReadMutation = useMarkNotificationAsRead();
//   const markAllAsReadMutation = useMarkAllNotificationsAsRead();
//   const deleteMutation = useDeleteNotification();
//   const clearAllMutation = useClearAllNotifications();

//   // Notifications are already merged in QueryClient cache by the provider
//   // WebSocket updates are automatically synced to the cache
//   const unreadCount = queryNotifications.filter((n) => !n.isRead).length;

//   return {
//     notifications: queryNotifications,
//     unreadCount,
//     isConnected,
//     isLoading,
//     error,
//     hasMore,
//     markAsRead: markAsReadMutation.mutateAsync,
//     markAllAsRead: markAllAsReadMutation.mutateAsync,
//     deleteNotification: deleteMutation.mutateAsync,
//     clearAll: clearAllMutation.mutateAsync,
//     loadMore: fetchNextPage,
//     refresh: refetch,
//   };
// }
