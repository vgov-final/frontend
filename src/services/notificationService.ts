import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { Notification, NotificationParams, NotificationResponse } from '@/types/notification';

class NotificationService {
  /**
   * Get user's notifications with pagination and filtering
   */
  async getNotifications(params: NotificationParams = {}): Promise<NotificationResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) searchParams.append('page', (params.page - 1).toString()); // Convert to 0-based
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params.notificationType && params.notificationType !== 'all') {
      searchParams.append('notificationType', params.notificationType);
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?${searchParams.toString()}`;
    const response = await apiService.get<{
      items: Notification[];
      pagination: {
        page: number;
        size: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    // Transform backend response to frontend format
    return {
      content: response.data.items,
      totalElements: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
      size: response.data.pagination.size,
      number: response.data.pagination.page - 1, // Convert back to 0-based for frontend
      first: response.data.pagination.page === 1,
      last: response.data.pagination.page === response.data.pagination.totalPages
    };
  }

  /**
   * Get user's notifications (simple list without pagination)
   */
  async getCurrentUserNotifications(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}/all`);
    return response.data;
  }

  /**
   * Get only unread notifications for current user
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiService.get<Notification[]>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD);
    return response.data;
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ count: number }>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data.count;
  }

  /**
   * Mark specific notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await apiService.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    await apiService.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }

  /**
   * Delete specific notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiService.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(id));
  }
}

export const notificationService = new NotificationService();
