import apiClient from './client';
import {
  ApiResponse,
  Message,
  PaginatedResponse,
  SendMessageData,
  User,
} from '../types/api';

export const messagesApi = {
  /**
   * Send a message
   */
  send: async (data: SendMessageData): Promise<ApiResponse<Message>> => {
    return apiClient.post<ApiResponse<Message>>('/messages', data);
  },

  /**
   * Get inbox messages
   */
  getInbox: async (params?: {
    page?: number;
    per_page?: number;
    is_read?: boolean;
  }): Promise<PaginatedResponse<Message>> => {
    return apiClient.get<PaginatedResponse<Message>>('/messages/inbox', params);
  },

  /**
   * Get sent messages
   */
  getSent: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Message>> => {
    return apiClient.get<PaginatedResponse<Message>>('/messages/sent', params);
  },

  /**
   * Get conversation with a user
   */
  getConversation: async (userId: number): Promise<ApiResponse<Message[]>> => {
    return apiClient.get<ApiResponse<Message[]>>(`/messages/conversation/${userId}`);
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.get<ApiResponse<{ count: number }>>('/messages/unread-count');
  },

  /**
   * Get list of admins to message
   */
  getAdmins: async (): Promise<ApiResponse<User[]>> => {
    return apiClient.get<ApiResponse<User[]>>('/messages/admins');
  },

  /**
   * Get message statistics
   */
  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/messages/statistics');
  },

  /**
   * Get single message by ID
   */
  getById: async (id: number): Promise<ApiResponse<Message>> => {
    return apiClient.get<ApiResponse<Message>>(`/messages/${id}`);
  },

  /**
   * Mark message as read
   */
  markAsRead: async (id: number): Promise<ApiResponse<Message>> => {
    return apiClient.put<ApiResponse<Message>>(`/messages/${id}/read`);
  },

  /**
   * Reply to a message
   */
  reply: async (id: number, body: string): Promise<ApiResponse<Message>> => {
    return apiClient.post<ApiResponse<Message>>(`/messages/${id}/reply`, { body });
  },

  /**
   * Delete a message
   */
  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/messages/${id}`);
  },
};

export default messagesApi;
