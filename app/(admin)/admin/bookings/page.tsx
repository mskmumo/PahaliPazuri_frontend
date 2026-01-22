'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Check, X, Calendar, User, Home, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Booking } from '@/lib/types/api';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.room?.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    return filtered;
  }, [bookings, searchQuery, statusFilter]);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Fetch real bookings from admin API
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Fetch bookings response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Bookings data:', data);
        setBookings(data.data || data.bookings || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch bookings:', response.status, errorText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove mock data - replaced with real API call above
  /*
  useEffect(() => {
    const fetchBookingsMock = async () => {
      try {
        setLoading(true);
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
                room_code: 'PP-R-101-G',
                floor_code: 'G',
                floor_number: 1,
                room_type: 'private',
                bed_type: 'single',
                total_beds: 1,
                available_beds: 0,
                description: null,
                price_per_night: 500,
                price_per_month: 15000,
                price_per_bed_night: 500,
                price_per_bed_month: 15000,
                base_price_per_bed_month: 15000,
                size_sqm: null,
                max_occupancy: 1,
                amenities: [],
                images: [],
                status: 'occupied',
                is_furnished: true,
                furnishing_details: null,
                gender_type: 'mixed',
                sharing_type: 'single',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
                base_price: 15000,
                actual_price: 15000,
                floor: 1,
                allowed_gender: 'any',
                has_private_bathroom: true,
                has_kitchen: false,
                condition: 'good',
                last_maintenance_date: null,
                view_quality: 'good',
                noise_level: 'moderate',
                natural_light: 'good',
              },
            },
            {
              id: 2,
              user_id: 2,
              room_id: 8,
              booking_reference: 'BK-002',
              check_in_date: '2024-03-01',
              check_out_date: '2024-09-01',
              duration_months: 6,
              duration_days: 0,
              number_of_occupants: 1,
              bed_number: null,
              base_rent: 18000,
              service_fee: 2000,
              deposit_amount: 15000,
              discount_amount: 0,
              total_amount: 35000,
              amount_paid: 15000,
              balance: 20000,
              payment_status: 'partial',
              status: 'confirmed',
              special_requests: null,
              admin_notes: null,
              cancellation_reason: null,
              cancelled_at: null,
              approved_at: '2024-01-20T10:00:00Z',
              created_at: '2024-01-18T10:00:00Z',
              updated_at: '2024-01-20T10:00:00Z',
              user: {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+254723456789',
                gender: 'female',
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
                created_at: '2024-01-18T10:00:00Z',
                updated_at: '2024-01-18T10:00:00Z',
              },
              room: {
                id: 8,
                apartment_id: 1,
                room_number: 'R-205',
                room_code: 'PP-R-205-2',
                floor_code: '2',
                floor_number: 2,
                room_type: 'private',
                bed_type: 'double_decker_2',
                total_beds: 1,
                available_beds: 0,
                description: null,
                price_per_night: 600,
                price_per_month: 18000,
                price_per_bed_night: 600,
                price_per_bed_month: 18000,
                base_price_per_bed_month: 18000,
                size_sqm: null,
                max_occupancy: 1,
                amenities: [],
                images: [],
                status: 'reserved',
                is_furnished: true,
                furnishing_details: null,
                gender_type: 'female_only',
                sharing_type: 'single',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-20T10:00:00Z',
                base_price: 18000,
                actual_price: 18000,
                floor: 2,
                allowed_gender: 'female',
                has_private_bathroom: true,
                has_kitchen: true,
                condition: 'excellent',
                last_maintenance_date: null,
                view_quality: 'excellent',
                noise_level: 'quiet',
                natural_light: 'excellent',
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

    fetchBookingsMock();
  }, []);
  */
  // End of commented mock data

  const refetchBookings = useCallback(() => {
    setBookings([]);
    setLoading(true);
    // Re-trigger fetch
  }, []);

  const handleApprove = async (bookingId: number) => {
    if (!confirm('Approve this booking? The tenant will be notified.')) return;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve booking');
      }

      alert('Booking approved! Tenant has been notified.');
      fetchBookings();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve booking');
    }
  };

  const handleReject = async (bookingId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject booking');
      }

      alert('Booking rejected.');
      fetchBookings();
    } catch (error) {
      console.error('Failed to reject booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'pending':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-blue-600">
                  {bookings.filter((b) => b.status === 'active').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-purple-600">{bookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by tenant, room, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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

          <div className="mt-4 flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredBookings.length}</span> of <span className="font-semibold text-foreground">{bookings.length}</span> bookings
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Bookings will appear here once tenants make reservations'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-4 px-4 font-semibold text-sm">Reference</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Tenant</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Room</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Duration</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Payment</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Status</th>
                    <th className="text-right py-4 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium">{booking.booking_reference}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{booking.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{booking.room?.room_number}</div>
                        <div className="text-xs text-muted-foreground">Floor {booking.room?.floor_number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{booking.duration_months} months</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                          {new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">KES {(booking.total_amount || 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Paid: {(booking.amount_paid || 0).toLocaleString()} | Bal: {(booking.balance || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {(booking.status === 'pending' || booking.status === 'cancelled') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(booking.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title={booking.status === 'cancelled' ? 'Re-approve' : 'Approve'}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              {booking.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(booking.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
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

