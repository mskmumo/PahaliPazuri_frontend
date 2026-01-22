'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CreditCard, XCircle, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { enhancedBookingsApi } from '@/lib/api/bookings';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Booking } from '@/lib/types/api';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await enhancedBookingsApi.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      // Use the v2 API for cancellation
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchBookings();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      confirmed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      approved: 'bg-green-100 text-green-800 hover:bg-green-100',
      active: 'bg-green-100 text-green-800 hover:bg-green-100',
      completed: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
      rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      unpaid: 'bg-red-100 text-red-800 hover:bg-red-100',
      partial: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      paid: 'bg-green-100 text-green-800 hover:bg-green-100',
      refunded: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['confirmed', 'approved', 'active'].includes(booking.status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(booking.status);
    return booking.status === filter;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">View and manage all your room bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookings.filter(b => ['confirmed', 'approved', 'active'].includes(b.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.payment_status !== 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          All ({bookings.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Active ({bookings.filter(b => ['confirmed', 'approved', 'active'].includes(b.status)).length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'past' ? 'default' : 'outline'}
          onClick={() => setFilter('past')}
          size="sm"
        >
          Past ({bookings.filter(b => ['completed', 'cancelled'].includes(b.status)).length})
        </Button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {bookings.length === 0
                  ? "You haven't made any bookings yet"
                  : `No ${filter} bookings found`}
              </p>
              {bookings.length === 0 && (
                <Button asChild>
                  <Link href="/rooms">Browse Rooms</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Booking ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Dates</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Payment</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium">#{booking.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          Room {booking.room?.room_number || booking.room_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.room?.apartment?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{booking.duration_months} months</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.number_of_occupants} occupant(s)
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>
                            {new Date(booking.check_in_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-muted-foreground">to</div>
                          <div>
                            {new Date(booking.check_out_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">KES {booking.total_amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Paid: {(booking.amount_paid || 0).toLocaleString()}
                        </div>
                        <div className={`text-xs ${(booking.balance || booking.total_amount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Balance: {(booking.balance || booking.total_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPaymentStatusBadge(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/tenant/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {booking.payment_status !== 'paid' && 
                           ['pending', 'confirmed', 'approved'].includes(booking.status) && (
                            <Link href={`/tenant/payments?booking_id=${booking.id}`}>
                              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
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
