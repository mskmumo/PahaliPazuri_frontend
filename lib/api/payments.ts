import apiClient from './client';
import {
  ApiResponse,
  InitiatePaymentData,
  Payment,
  PaymentInitiationResponse,
} from '../types/api';

export const paymentsApi = {
  /**
   * Initiate M-Pesa payment
   */
  initiateMpesa: async (data: InitiatePaymentData): Promise<ApiResponse<PaymentInitiationResponse>> => {
    return apiClient.post<ApiResponse<PaymentInitiationResponse>>('/payments/mpesa/initiate', data);
  },

  /**
   * Initiate PesaPal payment
   */
  initiatePesaPal: async (data: InitiatePaymentData): Promise<ApiResponse<PaymentInitiationResponse>> => {
    return apiClient.post<ApiResponse<PaymentInitiationResponse>>('/payments/pesapal/initiate', data);
  },

  /**
   * Query M-Pesa payment status
   */
  queryMpesaPayment: async (checkoutRequestId: string): Promise<ApiResponse<Payment>> => {
    return apiClient.post<ApiResponse<Payment>>('/payments/mpesa/query', {
      checkout_request_id: checkoutRequestId,
    });
  },

  /**
   * Get payment by ID
   */
  getById: async (id: number): Promise<ApiResponse<Payment>> => {
    return apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  /**
   * Get payments for a booking
   */
  getByBookingId: async (bookingId: number): Promise<ApiResponse<Payment[]>> => {
    return apiClient.get<ApiResponse<Payment[]>>(`/payments/booking/${bookingId}`);
  },
};

export default paymentsApi;
