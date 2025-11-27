import apiClient from './client';
import {
  ApiResponse,
  Document,
  DocumentType,
  PaginatedResponse,
} from '../types/api';

export const documentsApi = {
  /**
   * Upload a document
   */
  upload: async (data: {
    file: File;
    type: DocumentType;
    booking_id?: number;
  }): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('type', data.type);
    if (data.booking_id) {
      formData.append('booking_id', data.booking_id.toString());
    }

    return apiClient.post<ApiResponse<Document>>('/documents/upload', formData);
  },

  /**
   * Get user's documents
   */
  getAll: async (params?: {
    type?: DocumentType;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Document>> => {
    return apiClient.get<PaginatedResponse<Document>>('/documents', params);
  },

  /**
   * Get available document types
   */
  getTypes: async (): Promise<ApiResponse<string[]>> => {
    return apiClient.get<ApiResponse<string[]>>('/documents/types');
  },

  /**
   * Get single document by ID
   */
  getById: async (id: number): Promise<ApiResponse<Document>> => {
    return apiClient.get<ApiResponse<Document>>(`/documents/${id}`);
  },

  /**
   * Download a document
   */
  download: async (id: number): Promise<Blob> => {
    const response = await apiClient.request<Blob>(`/documents/${id}/download`, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Delete a document
   */
  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/documents/${id}`);
  },
};

export default documentsApi;
