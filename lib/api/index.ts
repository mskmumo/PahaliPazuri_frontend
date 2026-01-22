/**
 * API Integration Layer
 * 
 * This module provides a centralized export for all API services
 * to interact with the Pahali Pazuri backend.
 */

export { default as apiClient } from './client';
export { default as authApi } from './auth';
export { default as apartmentsApi } from './apartments';
export { default as roomsApi } from './rooms';
export { default as bookingsApi, enhancedBookingsApi } from './bookings';
export { default as paymentsApi } from './payments';
export { default as pricingApi } from './pricing';
export { default as maintenanceApi } from './maintenance';
export { default as documentsApi } from './documents';
export { default as invoicesApi } from './invoices';
export { default as notificationsApi } from './notifications';
export { default as tenantAllocationApi } from './tenant-allocation';
export { default as adminApi } from './admin';

// Re-export types
export * from '../types/api';
