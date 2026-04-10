import { type Notification, NotificationFilters } from '@/types/notification';

import { ApiResponse } from '@/types/api-response';
import { RequestOptions } from '../base-service';

export interface INotificationService {
  getNotifications(
    filters: Partial<NotificationFilters>,
    options?: RequestOptions
  ): Promise<ApiResponse<Notification[]>>;
  getNotification(
    notificationId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Notification>>;
  markAllAsRead(options?: RequestOptions): Promise<ApiResponse<void>>;
  markAsRead(notificationId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  deleteNotification(notificationId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  clearAll(options?: RequestOptions): Promise<ApiResponse<void>>;
  requestNotificationPermission(): Promise<boolean>;
  showBrowserNotification(notification: Notification): void;
}
