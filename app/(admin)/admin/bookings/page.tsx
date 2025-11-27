'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Booking } from '@/lib/types/api';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await adminApi.getAllBookings();
        
        // Mock data
        setTimeout(() => {
          const mockBookings: Booking[] = [
            {
              id: 1,
              user_id: 1,
              room_id: 5,
              booking_reference: 'BK-001',
              check_in_date: '2024-02-01',
              check_out_date: '2024-08-01',
              duration_months: 6,
              duration_days: 0,
              number_of_occupants: 1,
              bed_number: null,
              base_rent: 15000,
              service_fee: 2000,
              deposit_amount: 10000,
              discount_amount: 0,
              total_amount: 27000,
              amount_paid: 27000,
              balance: 0,
              payment_status: 'paid',
              status: 'pending',
              special_requests: null,
              admin_notes: null,
              cancellation_reason: null,
              cancelled_at: null,
              approved_at: null,
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
              user: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+254712345678',
                gender: 'male',
                id_number: null,
                date_of_birth: null,
                role: 'tenant',
                email_verified_at: null,
                notification_preferences: {
                  email_notifications: true,
                  sms_notifications: true,
                  push_notifications: true,
                  booking_updates: true,
                  payment_reminders: true,
                  maintenance_updates: true,
                  promotional_emails: false,
                },
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
              },
              room: {
                id: 5,
                apartment_id: 1,
                room_number: 'R-101',
                room_type: 'single',
                base_price: 15000,
                actual_price: 15000,
                description: null,
                floor: 1,
                amenities: [],
                images: [],
                status: 'occupied',
                available_beds: 0,
                total_beds: 1,
                allowed_gender: 'any',
                has_private_bathroom: true,
                has_kitchen: false,
                is_furnished: true,
                size_sqm: null,
                condition: 'good',
                last_maintenance_date: null,
                view_quality: 'good',
                noise_level: 'moderate',
                natural_light: 'good',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
              },
            },
          ];
          setBookings(mockBookings);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Compute filtered bookings - no need for useEffect or separate state
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = !searchQuery || 
      booking.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.room?.room_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const refetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await adminApi.getAllBookings();
      
      // Mock data
      setTimeout(() => {
        const mockBookings: Booking[] = [
          {
            id: 1,
            user_id: 1,
            room_id: 5,
            booking_reference: 'BK-001',
            check_in_date: '2024-02-01',
            check_out_date: '2024-08-01',
            duration_months: 6,
            duration_days: 0,
            number_of_occupants: 1,
            bed_number: null,
            base_rent: 15000,
            service_fee: 2000,
            deposit_amount: 10000,
            discount_amount: 0,
            total_amount: 27000,
            amount_paid: 27000,
            balance: 0,
            payment_status: 'paid',
            status: 'pending',
            special_requests: null,
            admin_notes: null,
            cancellation_reason: null,
            cancelled_at: null,
            approved_at: null,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            user: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+254712345678',
              gender: 'male',
              id_number: null,
              date_of_birth: null,
              role: 'tenant',
              email_verified_at: null,
              notification_preferences: {
                email_notifications: true,
                sms_notifications: true,
                push_notifications: true,
                booking_updates: true,
                payment_reminders: true,
                maintenance_updates: true,
                promotional_emails: false,
              },
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
            room: {
              id: 5,
              apartment_id: 1,
              room_number: 'R-101',
              room_type: 'single',
              base_price: 15000,
              actual_price: 15000,
              description: null,
              floor: 1,
              amenities: [],
              images: [],
              status: 'occupied',
              available_beds: 0,
              total_beds: 1,
              allowed_gender: 'any',
              has_private_bathroom: true,
              has_kitchen: false,
              is_furnished: true,
              size_sqm: null,
              condition: 'good',
              last_maintenance_date: null,
              view_quality: 'good',
              noise_level: 'moderate',
              natural_light: 'good',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
          },
        ];
        setBookings(mockBookings);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setLoading(false);
    }
  }, []);

  const handleApprove = async (bookingId: number) => {
    if (!confirm('Approve this booking?')) return;

    try {
      // TODO: Implement API call
      // await adminApi.updateBooking(bookingId, { status: 'confirmed' });
      console.log('Approving booking:', bookingId);
      alert('Booking approved');
      refetchBookings();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!confirm('Reject this booking?')) return;

    try {
      // TODO: Implement API call
      // await adminApi.updateBooking(bookingId, { status: 'cancelled' });
      console.log('Rejecting booking:', bookingId);
      alert('Booking rejected');
      refetchBookings();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert('Failed to reject booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-2">Manage all bookings and reservations</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by tenant or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter bookings by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Tenant</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Check-in</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{booking.user?.name}</div>
                        <div className="text-xs text-gray-500">{booking.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {booking.room?.room_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {booking.duration_months} month(s)
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        KES {booking.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(booking.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(booking.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
