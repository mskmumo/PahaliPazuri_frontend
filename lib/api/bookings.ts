import apiClient from './client';
import {
  ApiResponse,
  Booking,
  BookingFormMetadata,
  BookingStatistics,
  CreateBookingData,
  PaginatedResponse,
} from '../types/api';

export const bookingsApi = {
  /**
   * Create a new booking
   */
  create: async (data: CreateBookingData): Promise<ApiResponse<Booking>> => {
    return apiClient.post<ApiResponse<Booking>>('/bookings', data);
  },

  /**
   * Get user's bookings
   */
  getMyBookings: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings/my-bookings', params);
  },

  /**
   * Get user's bookings (alias for compatibility)
   */
  getUserBookings: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<Booking[]>> => {
    const response = await apiClient.get<PaginatedResponse<Booking>>('/bookings/my-bookings', params);
    return { success: true, data: response.data || [] };
  },

  /**
   * Get user's booking statistics
   */
  getMyStatistics: async (): Promise<ApiResponse<BookingStatistics>> => {
    return apiClient.get<ApiResponse<BookingStatistics>>('/bookings/my-statistics');
  },

  /**
   * Get single booking by ID
   */
  getById: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
  },

  /**
   * Get single booking (alias for compatibility)
   */
  getBooking: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
  },

  /**
   * Cancel a booking
   */
  cancel: async (id: number, reason?: string): Promise<ApiResponse<Booking>> => {
    return apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  },

  /**
   * Cancel booking (alias for compatibility)
   */
  cancelBooking: async (id: number, reason?: string): Promise<ApiResponse<Booking>> => {
    return apiClient.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  },
};

export const enhancedBookingsApi = {
  /**
   * Get form metadata for booking creation
   */
  getFormMetadata: async (): Promise<ApiResponse<BookingFormMetadata>> => {
    return apiClient.get<ApiResponse<BookingFormMetadata>>('/v2/bookings/form-metadata');
  },

  /**
   * Create a new enhanced booking
   */
  create: async (data: CreateBookingData): Promise<ApiResponse<Booking>> => {
    return apiClient.post<ApiResponse<Booking>>('/v2/bookings', data);
  },

  /**
   * Get user's bookings (v2)
   */
  getMyBookings: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>>('/v2/bookings/my-bookings', params);
  },

  /**
   * Check if user is a returning tenant
   */
  checkReturningTenant: async (): Promise<ApiResponse<{
    is_returning: boolean;
    previous_bookings_count: number;
    last_booking?: Booking;
  }>> => {
    return apiClient.get('/v2/bookings/check-returning-tenant');
  },

  /**
   * Get single booking by ID (v2)
   */
  getById: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.get<ApiResponse<Booking>>(`/v2/bookings/${id}`);
  },
};

export default bookingsApi;
