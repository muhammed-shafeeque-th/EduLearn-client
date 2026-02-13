import { type Notification, NotificationFilters } from '@/types/notification';

import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';

function getFilterParams(params?: NotificationFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params?.isRead) {
    searchParams.set('isRead', String(params?.isRead));
  }
  if (params?.category) {
    searchParams.set('category', params?.category);
  }
  // if (params?.sortBy) {
  //   searchParams.set('sortBy', params.sortBy);
  // }
  // if (params?.sortOrder) {
  //   searchParams.set('sortOrder', params.sortOrder);
  // }
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}

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

export class NotificationService extends BaseService implements INotificationService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/notifications`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  async getNotifications(
    filters: Partial<NotificationFilters>,
    options?: RequestOptions
  ): Promise<ApiResponse<Notification[]>> {
    const params = getFilterParams(filters);

    const queryString = params.toString();
    const endpoint = `/${queryString ? `?${queryString}` : ''}`;

    return this.get<ApiResponse<Notification[]>>(endpoint, options);
  }
  async getNotification(
    notificationId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Notification>> {
    return this.get<ApiResponse<Notification>>(`/${notificationId}`, options);
  }
  async markAsRead(notificationId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/${notificationId}/read`, options);
  }
  async markAllAsRead(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/read-all`, options);
  }
  async deleteNotification(
    notificationId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${notificationId}`, options);
  }
  async clearAll(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>('/', options);
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      new Notification(notification.subject, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
      });
    }
  }
}

export const notificationService = new NotificationService();
