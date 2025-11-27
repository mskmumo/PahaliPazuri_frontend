/**
 * Admin API Module
 * 
 * This module provides API functions for admin/staff operations.
 * These endpoints require admin-level authentication.
 * 
 * @module lib/api/admin
 */

import apiClient from '../client';
import {
  ApiResponse,
  Apartment,
  Booking,
  Document,
  Invoice,
  MaintenanceRequest,
  PaginatedResponse,
  Room,
  Staff,
  DashboardStatistics,
  User,
} from '../../types/api';

// Admin Apartment Management
export const adminApartmentsApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Apartment>> => {
    return apiClient.get<PaginatedResponse<Apartment>>('/admin/apartments', params);
  },

  create: async (data: any): Promise<ApiResponse<Apartment>> => {
    return apiClient.post<ApiResponse<Apartment>>('/admin/apartments', data);
  },

  getById: async (id: number): Promise<ApiResponse<Apartment>> => {
    return apiClient.get<ApiResponse<Apartment>>(`/admin/apartments/${id}`);
  },

  update: async (id: number, data: any): Promise<ApiResponse<Apartment>> => {
    return apiClient.put<ApiResponse<Apartment>>(`/admin/apartments/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/admin/apartments/${id}`);
  },

  getStatistics: async (id: number): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>(`/admin/apartments/${id}/statistics`);
  },
};

// Admin Room Management
export const adminRoomsApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Room>> => {
    return apiClient.get<PaginatedResponse<Room>>('/admin/rooms', params);
  },

  create: async (data: any): Promise<ApiResponse<Room>> => {
    return apiClient.post<ApiResponse<Room>>('/admin/rooms', data);
  },

  bulkCreate: async (apartmentId: number, data: any): Promise<ApiResponse<Room[]>> => {
    return apiClient.post<ApiResponse<Room[]>>(`/admin/apartments/${apartmentId}/rooms/bulk`, data);
  },

  getById: async (id: number): Promise<ApiResponse<Room>> => {
    return apiClient.get<ApiResponse<Room>>(`/admin/rooms/${id}`);
  },

  update: async (id: number, data: any): Promise<ApiResponse<Room>> => {
    return apiClient.put<ApiResponse<Room>>(`/admin/rooms/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/admin/rooms/${id}`);
  },

  checkAvailability: async (id: number, data: any): Promise<ApiResponse<any>> => {
    return apiClient.post<ApiResponse<any>>(`/admin/rooms/${id}/check-availability`, data);
  },

  updateAvailability: async (id: number, data: any): Promise<ApiResponse<Room>> => {
    return apiClient.post<ApiResponse<Room>>(`/admin/rooms/${id}/update-availability`, data);
  },
};

// Admin Booking Management
export const adminBookingsApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>>('/admin/bookings', params);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/bookings/statistics');
  },

  getUpcoming: async (params?: any): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>>('/admin/bookings/upcoming', params);
  },

  getActive: async (params?: any): Promise<PaginatedResponse<Booking>> => {
    return apiClient.get<PaginatedResponse<Booking>>('/admin/bookings/active', params);
  },

  getById: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.get<ApiResponse<Booking>>(`/admin/bookings/${id}`);
  },

  approve: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.put<ApiResponse<Booking>>(`/admin/bookings/${id}/approve`);
  },

  cancel: async (id: number, reason?: string): Promise<ApiResponse<Booking>> => {
    return apiClient.put<ApiResponse<Booking>>(`/admin/bookings/${id}/cancel`, { reason });
  },

  complete: async (id: number): Promise<ApiResponse<Booking>> => {
    return apiClient.put<ApiResponse<Booking>>(`/admin/bookings/${id}/complete`);
  },
};

// Admin Staff Management
export const adminStaffApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Staff>> => {
    return apiClient.get<PaginatedResponse<Staff>>('/admin/staff', params);
  },

  create: async (data: any): Promise<ApiResponse<Staff>> => {
    return apiClient.post<ApiResponse<Staff>>('/admin/staff', data);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/staff/statistics');
  },

  getAvailable: async (): Promise<ApiResponse<Staff[]>> => {
    return apiClient.get<ApiResponse<Staff[]>>('/admin/staff/available');
  },

  getById: async (id: number): Promise<ApiResponse<Staff>> => {
    return apiClient.get<ApiResponse<Staff>>(`/admin/staff/${id}`);
  },

  update: async (id: number, data: any): Promise<ApiResponse<Staff>> => {
    return apiClient.put<ApiResponse<Staff>>(`/admin/staff/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/admin/staff/${id}`);
  },

  updateAvailability: async (id: number, isAvailable: boolean): Promise<ApiResponse<Staff>> => {
    return apiClient.put<ApiResponse<Staff>>(`/admin/staff/${id}/availability`, {
      is_available: isAvailable,
    });
  },
};

// Admin Maintenance Management
export const adminMaintenanceApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<MaintenanceRequest>> => {
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>('/admin/maintenance', params);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/maintenance/statistics');
  },

  getPending: async (params?: any): Promise<PaginatedResponse<MaintenanceRequest>> => {
    return apiClient.get<PaginatedResponse<MaintenanceRequest>>('/admin/maintenance/pending', params);
  },

  getById: async (id: number): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.get<ApiResponse<MaintenanceRequest>>(`/admin/maintenance/${id}`);
  },

  assign: async (id: number, staffId: number): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.put<ApiResponse<MaintenanceRequest>>(`/admin/maintenance/${id}/assign`, {
      staff_id: staffId,
    });
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.put<ApiResponse<MaintenanceRequest>>(`/admin/maintenance/${id}/status`, {
      status,
    });
  },

  updatePriority: async (id: number, priority: string): Promise<ApiResponse<MaintenanceRequest>> => {
    return apiClient.put<ApiResponse<MaintenanceRequest>>(`/admin/maintenance/${id}/priority`, {
      priority,
    });
  },
};

// Admin Invoice Management
export const adminInvoicesApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Invoice>> => {
    return apiClient.get<PaginatedResponse<Invoice>>('/admin/invoices', params);
  },

  generate: async (data: any): Promise<ApiResponse<Invoice>> => {
    return apiClient.post<ApiResponse<Invoice>>('/admin/invoices/generate', data);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/invoices/statistics');
  },

  getRecent: async (params?: any): Promise<PaginatedResponse<Invoice>> => {
    return apiClient.get<PaginatedResponse<Invoice>>('/admin/invoices/recent', params);
  },

  getById: async (id: number): Promise<ApiResponse<Invoice>> => {
    return apiClient.get<ApiResponse<Invoice>>(`/admin/invoices/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<Invoice>> => {
    return apiClient.put<ApiResponse<Invoice>>(`/admin/invoices/${id}/status`, { status });
  },

  addNote: async (id: number, note: string): Promise<ApiResponse<Invoice>> => {
    return apiClient.post<ApiResponse<Invoice>>(`/admin/invoices/${id}/note`, { note });
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/admin/invoices/${id}`);
  },
};

// Admin Finance Reports
export const adminFinanceApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/dashboard');
  },

  getRevenueReport: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/revenue-report', params);
  },

  getBookingReport: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/booking-report', params);
  },

  getApartmentPerformance: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/apartment-performance');
  },

  getMonthlyTrend: async (months?: number): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/monthly-trend', { months });
  },

  getPaymentMethodBreakdown: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/finance/payment-methods');
  },
};

// Admin Dashboard
export const adminDashboardApi = {
  getStatistics: async (): Promise<ApiResponse<DashboardStatistics>> => {
    return apiClient.get<ApiResponse<DashboardStatistics>>('/admin/dashboard/statistics');
  },

  getRecentActivities: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiClient.get<ApiResponse<any[]>>('/admin/dashboard/activities', params);
  },

  getUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/admin/dashboard/users', params);
  },

  getUserStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/dashboard/user-statistics');
  },

  getSystemHealth: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/dashboard/system-health');
  },

  getQuickStats: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/dashboard/quick-stats');
  },

  updateUserStatus: async (id: number, status: string): Promise<ApiResponse<User>> => {
    return apiClient.put<ApiResponse<User>>(`/admin/dashboard/users/${id}/status`, { status });
  },
};

// Admin Document Management
export const adminDocumentsApi = {
  getAll: async (params?: any): Promise<PaginatedResponse<Document>> => {
    return apiClient.get<PaginatedResponse<Document>>('/admin/documents', params);
  },

  getStatistics: async (): Promise<ApiResponse<any>> => {
    return apiClient.get<ApiResponse<any>>('/admin/documents/statistics');
  },

  getPending: async (params?: any): Promise<PaginatedResponse<Document>> => {
    return apiClient.get<PaginatedResponse<Document>>('/admin/documents/pending', params);
  },

  getById: async (id: number): Promise<ApiResponse<Document>> => {
    return apiClient.get<ApiResponse<Document>>(`/admin/documents/${id}`);
  },

  verify: async (id: number): Promise<ApiResponse<Document>> => {
    return apiClient.put<ApiResponse<Document>>(`/admin/documents/${id}/verify`);
  },

  reject: async (id: number, reason: string): Promise<ApiResponse<Document>> => {
    return apiClient.put<ApiResponse<Document>>(`/admin/documents/${id}/reject`, { reason });
  },

  download: async (id: number): Promise<Blob> => {
    return apiClient.request<Blob>(`/admin/documents/${id}/download`, {
      method: 'GET',
    });
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/admin/documents/${id}`);
  },
};

// Dashboard Statistics
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStatistics>> => {
  const response = await apiClient.get<DashboardStatistics>('/admin/dashboard/stats');
  return { success: true, data: response };
};

// Tenant Management
export const getAllTenants = async (params?: {
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('/admin/tenants', params);
  return { success: true, data: response.data || [] };
};

export const getTenant = async (id: number): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<User>(`/admin/tenants/${id}`);
  return { success: true, data: response };
};

export const createTenant = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  id_number?: string;
}): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<User>('/admin/tenants', data);
  return { success: true, data: response };
};

export const updateTenant = async (
  id: number,
  data: Partial<User>
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<User>(`/admin/tenants/${id}`, data);
  return { success: true, data: response };
};

export const deleteTenant = async (id: number): Promise<ApiResponse<void>> => {
  await apiClient.delete(`/admin/tenants/${id}`);
  return { data: undefined, success: true };
};

// Booking Management
export const getAllBookings = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<Booking[]>> => {
  const response = await apiClient.get<PaginatedResponse<Booking>>('/admin/bookings', params);
  return { success: true, data: response.data || [] };
};

export const approveBooking = async (id: number): Promise<ApiResponse<Booking>> => {
  const response = await apiClient.post<Booking>(`/admin/bookings/${id}/approve`);
  return { success: true, data: response };
};

export const rejectBooking = async (
  id: number,
  reason?: string
): Promise<ApiResponse<Booking>> => {
  const response = await apiClient.post<Booking>(`/admin/bookings/${id}/reject`, { reason });
  return { success: true, data: response };
};

export const bulkApproveBookings = async (ids: number[]): Promise<ApiResponse<void>> => {
  await apiClient.post('/admin/bookings/bulk-approve', { booking_ids: ids });
  return { data: undefined, success: true };
};

export const bulkRejectBookings = async (
  ids: number[],
  reason?: string
): Promise<ApiResponse<void>> => {
  await apiClient.post('/admin/bookings/bulk-reject', { booking_ids: ids, reason });
  return { data: undefined, success: true };
};

// Maintenance Management
export const getAllMaintenanceRequests = async (params?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<MaintenanceRequest[]>> => {
  const response = await apiClient.get<PaginatedResponse<MaintenanceRequest>>(
    '/admin/maintenance',
    params
  );
  return { success: true, data: response.data || [] };
};

export const assignMaintenanceStaff = async (
  requestId: number,
  staffId: number
): Promise<ApiResponse<MaintenanceRequest>> => {
  const response = await apiClient.post<MaintenanceRequest>(
    `/admin/maintenance/${requestId}/assign`,
    { staff_id: staffId }
  );
  return { success: true, data: response };
};

export const bulkAssignMaintenance = async (
  requestIds: number[],
  staffId: number
): Promise<ApiResponse<void>> => {
  await apiClient.post('/admin/maintenance/bulk-assign', {
    request_ids: requestIds,
    staff_id: staffId,
  });
  return { data: undefined, success: true };
};

// Staff Management
export const getAllStaff = async (params?: {
  search?: string;
  specialization?: string;
  is_available?: boolean;
}): Promise<ApiResponse<Staff[]>> => {
  const response = await apiClient.get<Staff[]>('/admin/staff', params);
  return { success: true, data: response };
};

export const getStaff = async (id: number): Promise<ApiResponse<Staff>> => {
  const response = await apiClient.get<Staff>(`/admin/staff/${id}`);
  return { success: true, data: response };
};

export const createStaff = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
}): Promise<ApiResponse<Staff>> => {
  const response = await apiClient.post<Staff>('/admin/staff', data);
  return { success: true, data: response };
};

export const updateStaff = async (
  id: number,
  data: Partial<Staff>
): Promise<ApiResponse<Staff>> => {
  const response = await apiClient.put<Staff>(`/admin/staff/${id}`, data);
  return { success: true, data: response };
};

export const deleteStaff = async (id: number): Promise<ApiResponse<void>> => {
  await apiClient.delete(`/admin/staff/${id}`);
  return { data: undefined, success: true };
};

// Room Management
export const getAllRooms = async (params?: {
  status?: string;
  apartment_id?: number;
  search?: string;
}): Promise<ApiResponse<Room[]>> => {
  const response = await apiClient.get<Room[]>('/admin/rooms', params);
  return { success: true, data: response };
};

export const createRoom = async (data: {
  apartment_id: number;
  room_number: string;
  room_type: string;
  floor: number;
  total_beds: number;
  monthly_rent: number;
}): Promise<ApiResponse<Room>> => {
  const response = await apiClient.post<Room>('/admin/rooms', data);
  return { success: true, data: response };
};

export const updateRoom = async (
  id: number,
  data: Partial<Room>
): Promise<ApiResponse<Room>> => {
  const response = await apiClient.put<Room>(`/admin/rooms/${id}`, data);
  return { success: true, data: response };
};

export const deleteRoom = async (id: number): Promise<ApiResponse<void>> => {
  await apiClient.delete(`/admin/rooms/${id}`);
  return { data: undefined, success: true };
};

// Apartment Management
export const getAllApartments = async (params?: {
  search?: string;
}): Promise<ApiResponse<Apartment[]>> => {
  const response = await apiClient.get<Apartment[]>('/admin/apartments', params);
  return { success: true, data: response };
};

export const createApartment = async (data: {
  name: string;
  address: string;
  description: string;
}): Promise<ApiResponse<Apartment>> => {
  const response = await apiClient.post<Apartment>('/admin/apartments', data);
  return { success: true, data: response };
};

export const updateApartment = async (
  id: number,
  data: Partial<Apartment>
): Promise<ApiResponse<Apartment>> => {
  const response = await apiClient.put<Apartment>(`/admin/apartments/${id}`, data);
  return { success: true, data: response };
};

export const deleteApartment = async (id: number): Promise<ApiResponse<void>> => {
  await apiClient.delete(`/admin/apartments/${id}`);
  return { data: undefined, success: true };
};

// Payment Management
export const getAllPayments = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<PaginatedResponse<any>>('/admin/payments', params);
  return { success: true, data: response.data || [] };
};

export const verifyPayment = async (id: number): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<any>(`/admin/payments/${id}/verify`);
  return { success: true, data: response };
};

// Reports
export const generateReport = async (data: {
  report_type: string;
  start_date?: string;
  end_date?: string;
  format?: 'pdf' | 'excel' | 'csv';
}): Promise<ApiResponse<{ download_url: string }>> => {
  const response = await apiClient.post<{ download_url: string }>('/admin/reports/generate', data);
  return { success: true, data: response };
};

export const adminApi = {
  // Dashboard
  getDashboardStats,
  
  // Tenant Management
  getAllTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,

  // Booking Management  
  getAllBookings,
  approveBooking,
  rejectBooking,
  bulkApproveBookings,
  bulkRejectBookings,

  // Maintenance Management
  getAllMaintenanceRequests,
  assignMaintenanceStaff,
  bulkAssignMaintenance,

  // Staff Management
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,

  // Room Management
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,

  // Apartment Management
  getAllApartments,
  createApartment,
  updateApartment,
  deleteApartment,

  // Payment Management
  getAllPayments,
  verifyPayment,

  // Reports
  generateReport,

  // Legacy APIs (for backward compatibility)
  apartments: adminApartmentsApi,
  rooms: adminRoomsApi,
  bookings: adminBookingsApi,
  staff: adminStaffApi,
  maintenance: adminMaintenanceApi,
  invoices: adminInvoicesApi,
  finance: adminFinanceApi,
  dashboard: adminDashboardApi,
  documents: adminDocumentsApi,
};

export default adminApi;
