import apiClient from './client';
import {
  ApiResponse,
  Notification,
  NotificationPreferences,
  PaginatedResponse,
} from '../types/api';

export const notificationsApi = {
  /**
   * Get user's notifications
   */
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications', params);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  },

  /**
   * Get notification statistics
   */
  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/notifications/statistics');
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    return apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> => {
    return apiClient.put<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      preferences
    );
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/notifications/mark-all-read');
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>('/notifications/delete-all');
  },

  /**
   * Get single notification by ID
   */
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    return apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  /**
   * Delete a notification
   */
  delete: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/notifications/${id}`);
  },
};

export default notificationsApi;
