import apiClient from './client';
import { ApiResponse, Apartment, PaginatedResponse, Room } from '../types/api';

export const apartmentsApi = {
  /**
   * Get all apartments with optional filters
   */
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    city?: string;
    search?: string;
  }): Promise<PaginatedResponse<Apartment>> => {
    return apiClient.get<PaginatedResponse<Apartment>>('/apartments', params);
  },

  /**
   * Get single apartment by ID
   */
  getById: async (id: number): Promise<ApiResponse<Apartment>> => {
    return apiClient.get<ApiResponse<Apartment>>(`/apartments/${id}`);
  },

  /**
   * Get rooms for a specific apartment
   */
  getRooms: async (
    id: number,
    params?: {
      room_type?: string;
      status?: string;
      min_price?: number;
      max_price?: number;
    }
  ): Promise<ApiResponse<Room[]>> => {
    return apiClient.get<ApiResponse<Room[]>>(`/apartments/${id}/rooms`, params);
  },
};

export default apartmentsApi;
