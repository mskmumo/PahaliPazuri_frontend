import apiClient from './client';
import { ApiResponse, Room } from '../types/api';

export const tenantAllocationApi = {
  /**
   * Check tenant allocation compatibility
   */
  checkAllocation: async (data: {
    room_id: number;
    tenant_gender: 'male' | 'female';
    check_in_date: string;
    check_out_date: string;
  }): Promise<ApiResponse<{
    allowed: boolean;
    reason?: string;
    suggestions?: Room[];
  }>> => {
    return apiClient.post<ApiResponse<any>>('/tenant-allocation/check', data);
  },

  /**
   * Get available rooms for a tenant
   */
  getAvailableRooms: async (params: {
    tenant_gender: 'male' | 'female';
    check_in_date: string;
    check_out_date: string;
    room_type?: string;
    apartment_id?: number;
  }): Promise<ApiResponse<Room[]>> => {
    return apiClient.get<ApiResponse<Room[]>>('/tenant-allocation/available-rooms', params);
  },

  /**
   * Get recommended rooms based on preferences
   */
  getRecommendedRooms: async (params: {
    tenant_gender: 'male' | 'female';
    check_in_date: string;
    duration_months: number;
    max_budget?: number;
    preferred_room_type?: string;
  }): Promise<ApiResponse<Room[]>> => {
    return apiClient.get<ApiResponse<Room[]>>('/tenant-allocation/recommended-rooms', params);
  },

  /**
   * Validate group booking allocation
   */
  validateGroupBooking: async (data: {
    room_id: number;
    tenants: Array<{
      gender: 'male' | 'female';
      name: string;
    }>;
    check_in_date: string;
    check_out_date: string;
  }): Promise<ApiResponse<{
    valid: boolean;
    issues?: string[];
  }>> => {
    return apiClient.post<ApiResponse<any>>('/tenant-allocation/validate-group', data);
  },
};

export default tenantAllocationApi;
