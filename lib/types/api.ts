// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Auth Types
export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: 'male' | 'female';
  id_number: string | null;
  date_of_birth: string | null;
  role: Role | 'tenant' | 'admin' | 'super-admin' | 'staff' | 'maintenance_staff'; // Can be object (from API) or string (legacy/stored)
  email_verified_at: string | null;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_updates: boolean;
  payment_reminders: boolean;
  maintenance_updates: boolean;
  promotional_emails: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  gender: 'male' | 'female';
  id_number?: string;
  date_of_birth?: string;
}

// Apartment Types
export interface Apartment {
  id: number;
  name: string;
  code: string;
  description: string | null;
  address: string;
  location: string; // Area/City (e.g., "Kilimani", "Westlands")
  amenities: string[];
  images: string[];
  total_floors: number;
  is_active: boolean;
  created_by: number;
  registration_fee: number | null;
  security_deposit_percentage: number | null;
  cleaning_fee_monthly: number | null;
  electricity_included: boolean;
  electricity_token_contribution: number | null;
  campus_proximity?: string;
  created_at: string;
  updated_at: string;
  // Virtual/computed fields (may be added by backend)
  total_rooms?: number;
  available_rooms?: number;
}

// Room Types
export type RoomType = 'private' | 'shared_dorm'; // Updated from backend
export type BedType = 'single' | 'twin' | 'double_decker_2' | 'double_decker_4' | 'mixed' | 'bunk';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type LocationType = 'near_campus' | 'moderate' | 'far_campus';
export type GenderType = 'mixed' | 'male_only' | 'female_only';
export type SharingType = 'single' | '2_sharing' | '3_sharing' | '4_sharing';

export interface Room {
  id: number;
  apartment_id: number;
  apartment?: Apartment;
  room_number: string;
  room_code: string;
  floor_code: string;
  floor_number: number;
  room_type: RoomType;
  bed_type: BedType;
  total_beds: number;
  available_beds: number;
  description: string | null;
  price_per_night: number;
  price_per_month: number;
  price_per_bed_night: number;
  price_per_bed_month: number;
  base_price_per_bed_month: number;
  size_sqm: number | null;
  max_occupancy: number;
  amenities: string[];
  images: string[];
  status: RoomStatus;
  is_furnished: boolean;
  furnishing_details?: string | null;
  location_type: LocationType;
  gender_type: GenderType;
  sharing_type: SharingType;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  base_price?: number;
  actual_price?: number;
  floor?: number;
  allowed_gender?: 'male' | 'female' | 'any';
  has_private_bathroom?: boolean;
  has_kitchen?: boolean;
  condition?: 'excellent' | 'good' | 'fair' | 'needs_repair';
  last_maintenance_date?: string | null;
  view_quality?: 'excellent' | 'good' | 'average' | 'poor';
  noise_level?: 'quiet' | 'moderate' | 'noisy';
  natural_light?: 'excellent' | 'good' | 'fair' | 'poor';
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Booking {
  id: number;
  user_id: number;
  user?: User;
  room_id: number;
  room?: Room;
  booking_reference: string;
  check_in_date: string;
  check_out_date: string;
  duration_months: number;
  duration_days: number | null;
  number_of_occupants: number;
  bed_number: number | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  amount_paid: number;
  balance: number;
  base_rent: number;
  deposit_amount: number;
  service_fee: number;
  discount_amount: number;
  special_requests: string | null;
  admin_notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFormMetadata {
  max_duration_months: number;
  min_duration_months: number;
  deposit_percentage: number;
  service_fee_percentage: number;
  available_payment_methods: string[];
  cancellation_policy: string;
}

export interface CreateBookingData {
  room_id: number;
  check_in_date: string;
  duration_months: number;
  number_of_occupants: number;
  bed_number?: number;
  special_requests?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

export interface BookingAvailability {
  available: boolean;
  message: string;
  available_beds?: number[];
  conflicts?: any[];
}

// Payment Types
export type PaymentMethod = 'mpesa' | 'pesapal' | 'bank_transfer' | 'cash';
export type PaymentType = 'full' | 'deposit' | 'installment' | 'balance';

export interface Payment {
  id: number;
  booking_id: number;
  booking?: Booking;
  user_id: number;
  user?: User;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  transaction_id: string | null;
  mpesa_receipt_number: string | null;
  pesapal_tracking_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InitiatePaymentData {
  booking_id: number;
  amount: number;
  payment_type: PaymentType;
  phone_number?: string; // For M-Pesa
}

export interface PaymentInitiationResponse {
  payment_id: number;
  checkout_url?: string; // For PesaPal
  merchant_request_id?: string; // For M-Pesa
  checkout_request_id?: string; // For M-Pesa
  message: string;
}

// Maintenance Types
export type MaintenanceStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'appliance' | 'structural' | 'other';

export interface MaintenanceRequest {
  id: number;
  user_id: number;
  user?: User;
  room_id: number;
  room?: Room;
  staff_id: number | null;
  staff?: Staff;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduled_date: string | null;
  completed_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  feedback: string | null;
  rating: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateMaintenanceData {
  room_id: number;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  images?: File[];
}

// Staff Types
export interface Staff {
  id: number;
  user_id: number | null;
  user?: User;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  status: 'active' | 'inactive' | 'on_leave';
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  booking_id: number;
  booking?: Booking;
  user_id: number;
  user?: User;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Message Types
export interface Message {
  id: number;
  sender_id: number;
  sender?: User;
  recipient_id: number;
  recipient?: User;
  subject: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SendMessageData {
  recipient_id: number;
  subject: string;
  body: string;
  parent_id?: number;
}

// Document Types
export type DocumentType = 'id_card' | 'passport' | 'lease_agreement' | 'payment_proof' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export interface Document {
  id: number;
  user_id: number;
  user?: User;
  booking_id: number | null;
  booking?: Booking;
  type: DocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  verified_at: string | null;
  verified_by: number | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Pricing Types
export interface PricingCalculation {
  base_rent: number;
  duration_months: number;
  deposit_amount: number;
  service_fee: number;
  discount_amount: number;
  subtotal: number;
  total_amount: number;
  breakdown: {
    monthly_rent: number;
    total_rent: number;
    deposit: number;
    service_fee: number;
    discount: number;
  };
}

export interface InstallmentPlan {
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  number_of_installments: number;
  installment_amount: number;
  installments: {
    installment_number: number;
    amount: number;
    due_date: string;
  }[];
}

// Statistics Types
export interface BookingStatistics {
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  average_booking_duration: number;
}

export interface DashboardStatistics {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  pending_maintenance: number;
  recent_activities: any[];
}

// CMS Types
export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
