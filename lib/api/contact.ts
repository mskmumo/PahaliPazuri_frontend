import apiClient from './client';
import { ApiResponse } from '../types/api';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  business_hours: string;
  emergency_contact: string;
}

export const contactApi = {
  /**
   * Submit contact form
   */
  submit: async (data: ContactFormData): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/contact/submit', data);
  },

  /**
   * Get contact information
   */
  getInfo: async (): Promise<ApiResponse<ContactInfo>> => {
    return apiClient.get<ApiResponse<ContactInfo>>('/contact/info');
  },
};

export default contactApi;
