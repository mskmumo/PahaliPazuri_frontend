import { ApiError } from '../types/api';

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: ApiError): string {
  if (error.errors) {
    // Get first error message from validation errors
    const firstErrorKey = Object.keys(error.errors)[0];
    if (firstErrorKey && error.errors[firstErrorKey]?.length > 0) {
      return error.errors[firstErrorKey][0];
    }
  }
  return error.message || 'An unexpected error occurred';
}

/**
 * Get all validation error messages
 */
export function getValidationErrors(error: ApiError): Record<string, string> {
  if (!error.errors) return {};
  
  const formattedErrors: Record<string, string> = {};
  Object.entries(error.errors).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      formattedErrors[key] = messages[0];
    }
  });
  
  return formattedErrors;
}

/**
 * Format date for API (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse API date string to Date object
 */
export function parseApiDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? parseApiDate(date) : date;
  
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseApiDate(date) : date;
  
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseApiDate(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDate(dateObj);
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Booking statuses
    pending: 'yellow',
    confirmed: 'blue',
    active: 'green',
    completed: 'gray',
    cancelled: 'red',
    
    // Payment statuses
    paid: 'green',
    partial: 'yellow',
    overdue: 'red',
    
    // Room statuses
    available: 'green',
    occupied: 'blue',
    maintenance: 'orange',
    reserved: 'yellow',
    
    // Maintenance statuses
    assigned: 'blue',
    in_progress: 'yellow',
  };
  
  return statusColors[status.toLowerCase()] || 'gray';
}

/**
 * Calculate booking duration in months
 */
export function calculateDuration(checkIn: string, checkOut: string): number {
  const start = parseApiDate(checkIn);
  const end = parseApiDate(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.ceil(diffDays / 30);
}

/**
 * Validate phone number (Kenyan format)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Kenyan phone numbers: 07XX XXX XXX or +2547XX XXX XXX or 2547XX XXX XXX
  const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove spaces and special characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to 254 format
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  if (cleaned.startsWith('+254')) {
    return cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
