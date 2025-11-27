import apiClient from './client';
import {
  ApiResponse,
  CreateMaintenanceData,
  MaintenanceRequest,
  PaginatedResponse,
} from '../types/api';

export const maintenanceApi = {
  /**
   * Create a maintenance request
   */
  create: async (data: CreateMaintenanceData): Promise<ApiResponse<MaintenanceRequest>> => {
    const formData = new FormData();
    formData.append('room_id', data.room_id.toString());
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);

    // Add images if present
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    return apiClient.post<ApiResponse<MaintenanceRequest>>('/maintenance', formData);
  },

  /**
   * Get user's maintenance requests
   */
  getMyRequests: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<MaintenanceRequest>> => {
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>('/maintenance/my-requests', params);
  },

  /**
   * Get single maintenance request by ID
   */
  getById: async (id: number): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.get<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}`);
  },

  /**
   * Add feedback to completed maintenance request
   */
  addFeedback: async (
    id: number,
    data: {
      feedback: string;
      rating: number;
    }
  ): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.post<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}/feedback`, data);
  },

  /**
   * Update maintenance request (staff/admin)
   */
  update: async (
    id: number,
    data: {
      status?: string;
      scheduled_date?: string;
      estimated_cost?: number;
      actual_cost?: number;
    }
  ): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.put<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}`, data);
  },
};

export default maintenanceApi;
