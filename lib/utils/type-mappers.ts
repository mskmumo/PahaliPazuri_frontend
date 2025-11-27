/**
 * Type mapping utilities to bridge differences between API types and component expectations
 */

import type { Booking, MaintenanceRequest, Message, Room } from '../types/api';

/**
 * Extended Booking type with computed fields for backward compatibility
 */
export type ExtendedBooking = Booking & {
  start_date: string;
  end_date: string;
  duration_type: 'nightly' | 'monthly';
  nights: number;
  number_of_months: number;
  beds_booked: number;
  booking_type: 'individual' | 'group';
  room_charges: number;
  registration_fee: number;
  security_deposit: number;
  cleaning_fee: number;
  electricity_contribution: number;
  payment_plan: 'full' | 'installment';
  installment_count?: number;
  installment_amount?: number;
};

/**
 * Map API Booking to Extended Booking with computed fields
 */
export function mapBooking(booking: Booking): ExtendedBooking {
  return {
    ...booking,
    start_date: booking.check_in_date,
    end_date: booking.check_out_date,
    duration_type: booking.duration_days ? 'nightly' : 'monthly',
    nights: booking.duration_days || 0,
    number_of_months: booking.duration_months,
    beds_booked: booking.number_of_occupants,
    booking_type: 'individual',
    room_charges: booking.base_rent,
    registration_fee: booking.service_fee,
    security_deposit: booking.deposit_amount,
    cleaning_fee: 0,
    electricity_contribution: 0,
    payment_plan: 'full',
  };
}

/**
 * Extended Room type with additional fields
 */
export type ExtendedRoom = Room & {
  floor_number: number;
  bed_type: string;
};

/**
 * Map API Room to Extended Room
 */
export function mapRoom(room: Room): ExtendedRoom {
  return {
    ...room,
    floor_number: room.floor || 0,
    bed_type: 'single',
  };
}

/**
 * Extended Maintenance Request with additional fields
 */
export type ExtendedMaintenanceRequest = MaintenanceRequest & {
  assigned_to?: number;
  staff_notes?: string;
  completed_at?: string;
};

/**
 * Map API Maintenance Request to Extended
 */
export function mapMaintenanceRequest(request: MaintenanceRequest): ExtendedMaintenanceRequest {
  return {
    ...request,
    assigned_to: request.staff_id || undefined,
    staff_notes: undefined,
    completed_at: request.completed_date || undefined,
  };
}

/**
 * Extended Message with additional fields
 */
export type ExtendedMessage = Message & {
  receiver_id: number;
  receiver?: any;
  is_urgent: boolean;
};

/**
 * Map API Message to Extended
 */
export function mapMessage(message: Message): ExtendedMessage {
  return {
    ...message,
    receiver_id: message.recipient_id,
    receiver: message.recipient,
    is_urgent: false,
  };
}
