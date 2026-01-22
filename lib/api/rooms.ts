import apiClient from './client';
import { ApiResponse, Room, PaginatedResponse, BookingAvailability } from '../types/api';

export const roomsApi = {
  /**
   * Get all rooms with optional filters
   */
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    apartment_id?: number;
    room_type?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    allowed_gender?: string;
  }): Promise<PaginatedResponse<Room>> => {
    return apiClient.get<PaginatedResponse<Room>>('/rooms', params);
  },

  /**
   * Get single room by ID
   */
  getById: async (id: number): Promise<ApiResponse<Room>> => {
    return apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
  },

  /**
   * Check room availability
   */
  checkAvailability: async (
    id: number,
    data: {
      check_in_date: string;
      check_out_date: string;
      number_of_occupants?: number;
    }
  ): Promise<ApiResponse<BookingAvailability>> => {
    return apiClient.post<ApiResponse<BookingAvailability>>(
      `/rooms/${id}/check-availability`,
      data
    );
  },

  /**
   * Get detailed bed availability with real-time status
   */
  getBedAvailability: async (
    id: number,
    params: {
      check_in_date: string;
      duration_months?: number;
      check_out_date?: string;
    }
  ): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>(
      `/rooms/${id}/beds/availability`,
      params
    );
  },
};

export default roomsApi;
