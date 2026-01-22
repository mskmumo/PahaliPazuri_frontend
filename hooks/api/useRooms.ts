import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api/rooms';
import type { Room, ApiResponse, PaginatedResponse } from '@/lib/types/api';

// Query Keys
export const roomKeys = {
    all: ['rooms'] as const,
    lists: () => [...roomKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...roomKeys.lists(), params] as const,
    details: () => [...roomKeys.all, 'detail'] as const,
    detail: (id: number) => [...roomKeys.details(), id] as const,
    availability: (id: number, dates: { start: string; end: string }) =>
        [...roomKeys.detail(id), 'availability', dates] as const,
};

/**
 * Hook to fetch all rooms with optional filters
 */
export function useRooms(params?: {
    apartment_id?: number;
    room_type?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    per_page?: number;
}) {
    return useQuery({
        queryKey: roomKeys.list(params || {}),
        queryFn: () => roomsApi.getAll(params),
    });
}

/**
 * Hook to fetch a single room by ID
 */
export function useRoom(id: number) {
    return useQuery({
        queryKey: roomKeys.detail(id),
        queryFn: () => roomsApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to check room availability for given dates
 */
export function useRoomAvailability(
    roomId: number,
    checkInDate: string,
    checkOutDate: string,
    numberOfOccupants?: number,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: roomKeys.availability(roomId, { start: checkInDate, end: checkOutDate }),
        queryFn: () => roomsApi.checkAvailability(roomId, {
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            number_of_occupants: numberOfOccupants,
        }),
        enabled: enabled && !!roomId && !!checkInDate && !!checkOutDate,
    });
}

/**
 * Hook to get bed availability for a room
 */
export function useRoomBedAvailability(
    roomId: number,
    checkInDate: string,
    durationMonths?: number,
    checkOutDate?: string
) {
    return useQuery({
        queryKey: [...roomKeys.detail(roomId), 'beds', { checkInDate, durationMonths, checkOutDate }],
        queryFn: () => roomsApi.getBedAvailability(roomId, {
            check_in_date: checkInDate,
            duration_months: durationMonths,
            check_out_date: checkOutDate,
        }),
        enabled: !!roomId && !!checkInDate,
    });
}
