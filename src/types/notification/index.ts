export type NotificationType = 'course' | 'assignment' | 'achievement' | 'system' | 'message';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationFilter = 'all' | 'unread' | 'read';

export interface Notification {
  id: string;
  type: string;
  userId: string;
  subject: string;
  message: string;
  recipient: string;
  isRead: boolean;
  createdAt: string;
  priority: NotificationPriority;
  actionUrl: string;
  category: string;
  metadata: Record<string, string>;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  category?: NotificationType;
}

export interface WebSocketMessage {
  type: 'notification' | 'ping' | 'pong';
  data?: Notification;
}

export interface UseNotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}
