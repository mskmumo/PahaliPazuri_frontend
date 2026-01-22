import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, enhancedBookingsApi } from '@/lib/api/bookings';
import type {
    Booking,
    CreateBookingData,
    BookingStatistics,
    PaginatedResponse,
    ApiResponse
} from '@/lib/types/api';

// Query Keys
export const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    list: (params: Record<string, unknown>) => [...bookingKeys.lists(), params] as const,
    details: () => [...bookingKeys.all, 'detail'] as const,
    detail: (id: number) => [...bookingKeys.details(), id] as const,
    myBookings: (params?: Record<string, unknown>) => [...bookingKeys.all, 'my', params] as const,
    statistics: () => [...bookingKeys.all, 'statistics'] as const,
};

/**
 * Hook to fetch user's bookings
 */
export function useMyBookings(params?: {
    status?: string;
    page?: number;
    per_page?: number;
}) {
    return useQuery({
        queryKey: bookingKeys.myBookings(params),
        queryFn: () => bookingsApi.getMyBookings(params),
    });
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(id: number) {
    return useQuery({
        queryKey: bookingKeys.detail(id),
        queryFn: () => bookingsApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to fetch user's booking statistics
 */
export function useMyBookingStatistics() {
    return useQuery({
        queryKey: bookingKeys.statistics(),
        queryFn: () => bookingsApi.getMyStatistics(),
    });
}

/**
 * Hook to create a new booking
 */
export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBookingData) => bookingsApi.create(data),
        onSuccess: () => {
            // Invalidate all booking queries to refetch fresh data
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Hook to create an enhanced booking (v2 API)
 */
export function useCreateEnhancedBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBookingData) => enhancedBookingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            bookingsApi.cancel(id, reason),
        onSuccess: (_, variables) => {
            // Invalidate the specific booking and the list
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: bookingKeys.statistics() });
        },
    });
}

/**
 * Hook to check if user is a returning tenant
 */
export function useCheckReturningTenant() {
    return useQuery({
        queryKey: ['bookings', 'returning-tenant'],
        queryFn: () => enhancedBookingsApi.checkReturningTenant(),
    });
}

/**
 * Hook to get form metadata for booking
 */
export function useBookingFormMetadata() {
    return useQuery({
        queryKey: ['bookings', 'form-metadata'],
        queryFn: () => enhancedBookingsApi.getFormMetadata(),
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes (rarely changes)
    });
}
