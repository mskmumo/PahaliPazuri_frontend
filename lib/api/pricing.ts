import apiClient from './client';
import {
  ApiResponse,
  PricingCalculation,
  InstallmentPlan,
} from '../types/api';

export const pricingApi = {
  /**
   * Calculate booking price
   */
  calculateBookingPrice: async (data: {
    room_id: number;
    check_in_date: string;
    duration_months: number;
    number_of_occupants?: number;
  }): Promise<ApiResponse<PricingCalculation>> => {
    return apiClient.post<ApiResponse<PricingCalculation>>('/pricing/calculate', data);
  },

  /**
   * Get room pricing breakdown
   */
  getRoomPricingBreakdown: async (roomId: number): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>(`/pricing/room/${roomId}/breakdown`);
  },

  /**
   * Calculate installment plan
   */
  calculateInstallments: async (data: {
    total_amount: number;
    deposit_amount: number;
    number_of_installments: number;
    start_date: string;
  }): Promise<ApiResponse<InstallmentPlan>> => {
    return apiClient.post<ApiResponse<InstallmentPlan>>('/pricing/installments', data);
  },

  /**
   * Get pricing factors
   */
  getPricingFactors: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/pricing/factors');
  },

  /**
   * Get suggested room price
   */
  suggestRoomPrice: async (data: {
    room_type: string;
    apartment_id: number;
    floor?: number;
    has_private_bathroom?: boolean;
    is_furnished?: boolean;
  }): Promise<ApiResponse<{ suggested_price: number }>> => {
    return apiClient.post<ApiResponse<{ suggested_price: number }>>('/pricing/suggest', data);
  },
};

export default pricingApi;
