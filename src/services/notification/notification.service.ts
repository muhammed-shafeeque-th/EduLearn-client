import { type Notification, NotificationFilters } from '@/types/notification';

import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { INotificationService } from './notification.service.interface';
import { getFilterParams } from './notification.types';

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

  static create(serviceOptions: BaseServiceOptions): INotificationService {
    return new NotificationService(serviceOptions);
  }
}

export const notificationService = new NotificationService();
