import apiClient from './client';
import { ApiResponse, CmsPage, PaginatedResponse } from '../types/api';

export const cmsApi = {
  /**
   * Get all CMS pages
   */
  getAll: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<CmsPage>> => {
    return apiClient.get<PaginatedResponse<CmsPage>>('/cms/pages', params);
  },

  /**
   * Get CMS page by slug
   */
  getBySlug: async (slug: string): Promise<ApiResponse<CmsPage>> => {
    return apiClient.get<ApiResponse<CmsPage>>(`/cms/pages/${slug}`);
  },
};

export default cmsApi;
