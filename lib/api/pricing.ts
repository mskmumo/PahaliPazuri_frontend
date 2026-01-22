import apiClient from './client';
import {
  ApiResponse,
  PricingCalculation,
  InstallmentPlan,
} from '../types/api';

export interface OneTimeCharge {
  name: string;
  description: string;
  amount: number;
  refundable: boolean;
}

export interface RecurringCharge {
  name: string;
  description: string;
  monthly_amount: number;
  total_amount: number;
  frequency: string;
}

export interface ComprehensivePricing {
  base_room_charges: number;
  discount_applied: number;
  discount_percentage: number;
  room_charges_after_discount: number;
  vat_amount: number;
  vat_rate: number;
  room_charges_with_vat: number;
  price_per_bed_per_month: number;
  price_per_bed_per_month_with_vat: number;
  number_of_beds: number;
  number_of_months: number;
  duration_type: string;
  monthly_rent: number;
  monthly_rent_before_vat: number;
  monthly_rent_vat: number;
  one_time_charges: Record<string, OneTimeCharge>;
  one_time_total: number;
  refundable_deposits: number;
  recurring_charges: Record<string, RecurringCharge>;
  recurring_monthly_total: number;
  recurring_total: number;
  subtotal: number;
  total_payable: number;
  total_non_refundable: number;
  move_in_cost: number;
  breakdown: {
    room_rent: string;
    one_time_fees: string;
    recurring_fees: string;
    vat_info: string;
    total: string;
  };
}

export interface PricingSummary {
  price_per_bed_per_month: number;
  monthly_rent: number;
  security_deposit: number;
  registration_fee: number;
  cleaning_fee_monthly: number;
  estimated_move_in_cost: number;
}

export interface MoveInCostBreakdown {
  move_in_cost: number;
  breakdown: {
    first_month_rent: number;
    one_time_charges: Record<string, OneTimeCharge>;
    recurring_charges_month_1: Record<string, RecurringCharge>;
  };
}

export interface ChargeDefinition {
  name: string;
  description: string;
  default: number;
  required: boolean;
  refundable?: boolean;
  frequency?: string;
  conditional?: string;
  default_percentage?: number;
}

export interface AvailableCharges {
  one_time_charges: Record<string, ChargeDefinition>;
  recurring_charges: Record<string, ChargeDefinition>;
  default_one_time: string[];
  default_recurring: string[];
}

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
   * Get suggested room price based on configuration
   */
  suggestRoomPrice: async (data: {
    sharing_type: string;
    gender_type: string;
    amenities?: string[];
  }): Promise<ApiResponse<{ suggested_price_per_bed_per_month: number }>> => {
    return apiClient.post<ApiResponse<{ suggested_price_per_bed_per_month: number }>>('/pricing/suggest', data);
  },

  /**
   * Get available pricing charges (one-time and recurring)
   */
  getAvailableCharges: async (): Promise<ApiResponse<AvailableCharges>> => {
    return apiClient.get<ApiResponse<AvailableCharges>>('/pricing/charges');
  },

  /**
   * Calculate comprehensive pricing for a room
   */
  calculateComprehensivePricing: async (
    roomId: number,
    params: {
      beds: number;
      duration_type: 'monthly' | 'semester' | 'yearly';
      custom_months?: number;
      one_time_charges?: string[];
      recurring_charges?: string[];
    }
  ): Promise<ApiResponse<ComprehensivePricing>> => {
    return apiClient.post<ApiResponse<ComprehensivePricing>>(`/pricing/room/${roomId}/comprehensive`, params);
  },

  /**
   * Get pricing summary for a room (simplified)
   */
  getRoomPricingSummary: async (roomId: number): Promise<ApiResponse<PricingSummary>> => {
    return apiClient.get<ApiResponse<PricingSummary>>(`/pricing/room/${roomId}/summary`);
  },

  /**
   * Calculate move-in cost
   */
  calculateMoveInCost: async (
    roomId: number,
    params: {
      beds: number;
      one_time_charges?: string[];
      recurring_charges?: string[];
    }
  ): Promise<ApiResponse<MoveInCostBreakdown>> => {
    return apiClient.post<ApiResponse<MoveInCostBreakdown>>(`/pricing/room/${roomId}/move-in-cost`, params);
  },
};

export default pricingApi;
