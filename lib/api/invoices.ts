import apiClient from './client';
import { ApiResponse, Invoice, PaginatedResponse } from '../types/api';

export const invoicesApi = {
  /**
   * Get user's invoices
   */
  getAll: async (params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Invoice>> => {
    return apiClient.get<PaginatedResponse<Invoice>>('/invoices', params);
  },

  /**
   * Get single invoice by ID
   */
  getById: async (id: number): Promise<ApiResponse<Invoice>> => {
    return apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  },

  /**
   * Get invoice by invoice number
   */
  getByNumber: async (invoiceNumber: string): Promise<ApiResponse<Invoice>> => {
    return apiClient.get<ApiResponse<Invoice>>(`/invoices/number/${invoiceNumber}`);
  },
};

export default invoicesApi;
