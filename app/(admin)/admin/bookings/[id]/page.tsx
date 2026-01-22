'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, User, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Booking } from '@/lib/types/api';
import { adminApi } from '@/lib/api';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = parseInt(params.id as string);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.bookings.getById(bookingId);
      // Handle both response formats: { data: booking } or { booking: booking }
      const bookingData = response.data || (response as any).booking;
      setBooking(bookingData);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleApprove = async () => {
    if (!confirm('Approve this booking?')) return;

    try {
      setUpdating(true);
      await adminApi.bookings.approve(bookingId);
      alert('Booking approved successfully');
      fetchBooking();
      router.push('/admin/bookings');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter a reason for cancellation:');
    if (reason === null) return; // User cancelled prompt
    if (!reason.trim()) {
      alert('Cancellation reason is required');
      return;
    }

    try {
      setUpdating(true);
      await adminApi.bookings.cancel(bookingId, reason);
      alert('Booking cancelled successfully');
      router.push('/admin/bookings');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setUpdating(false);
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
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Error Loading Booking</h2>
        <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
        <Link href="/admin/bookings">
          <Button>Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link
        href="/admin/bookings"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to bookings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
          <div className="flex gap-2 mt-3">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            <Badge className={getPaymentStatusColor(booking.payment_status)}>
              {booking.payment_status}
            </Badge>
          </div>
        </div>

        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={updating}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Cancel button for confirmed bookings */}
        {booking.status === 'confirmed' && (
          <Button
            onClick={handleReject}
            disabled={updating}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Booking
          </Button>
        )}

        {/* Re-approve button for cancelled bookings */}
        {booking.status === 'cancelled' && (
          <Button
            onClick={handleApprove}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Re-approve Booking
          </Button>
        )}
      </div>

      {/* Tenant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{booking.user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{booking.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{booking.user?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p className="font-medium">{booking.room?.room_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Check-in Date</p>
                <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Check-out Date</p>
                <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{booking.duration_months} month(s)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Occupants</p>
                <p className="font-medium">{booking.number_of_occupants}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Rent</span>
              <span className="font-medium">KES {(booking.base_rent || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">KES {(booking.service_fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deposit</span>
              <span className="font-medium">KES {(booking.deposit_amount || 0).toLocaleString()}</span>
            </div>
            {(booking.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- KES {(booking.discount_amount || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-3 border-t">
              <span>Total Amount</span>
              <span>KES {(booking.total_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium text-green-600">KES {(booking.amount_paid || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance</span>
              <span className={(booking.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                KES {(booking.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span>{new Date(booking.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span>{new Date(booking.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
