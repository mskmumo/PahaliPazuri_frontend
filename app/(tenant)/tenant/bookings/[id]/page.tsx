'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, XCircle, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { enhancedBookingsApi } from '@/lib/api/bookings';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Booking } from '@/lib/types/api';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = parseInt(params.id as string);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await enhancedBookingsApi.getById(bookingId);
      setBooking(response.data);
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

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      // Use v2 API for cancellation
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      router.push('/tenant/bookings');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !booking) {
    return <ErrorMessage message={error || 'Booking not found'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenant/bookings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
          <p className="text-muted-foreground">Complete booking details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Booking Information</CardTitle>
                  <CardDescription>
                    Room {booking.room?.room_number} - {booking.room?.apartment?.name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={`bg-${booking.status === 'active' ? 'green' : 'yellow'}-100 text-${booking.status === 'active' ? 'green' : 'yellow'}-800`}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check-in Date</p>
                  <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check-out Date</p>
                  <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{booking.duration_months} month(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Days</p>
                  <p className="font-medium">{booking.duration_days || 0} day(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Occupants</p>
                  <p className="font-medium">{booking.number_of_occupants}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bed Number</p>
                  <p className="font-medium">{booking.bed_number || 'N/A'}</p>
                </div>
              </div>

              {booking.special_requests && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                  <p className="text-sm">{booking.special_requests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Details */}
          {booking.room && (
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Room Number</p>
                    <p className="font-medium">{booking.room.room_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Floor</p>
                    <p className="font-medium">{booking.room.floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Room Type</p>
                    <p className="font-medium capitalize">{booking.room.room_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Beds</p>
                    <p className="font-medium">{booking.room.total_beds || 'N/A'}</p>
                  </div>
                </div>

                {booking.room.amenities && booking.room.amenities.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <Badge className={`bg-${booking.payment_status === 'paid' ? 'green' : 'yellow'}-100 text-${booking.payment_status === 'paid' ? 'green' : 'yellow'}-800`}>
                {booking.payment_status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span>KES {booking.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Duration</span>
                  <span>{booking.duration_months} months{booking.duration_days ? ` (${booking.duration_days} days)` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-green-600">KES {(booking.amount_paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Balance</span>
                  <span className={(booking.balance || booking.total_amount) > 0 ? 'text-red-600' : 'text-green-600'}>
                    KES {(booking.balance || booking.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                {booking.payment_status !== 'paid' && (
                  <Button className="w-full" asChild>
                    <Link href={`/tenant/payments?booking_id=${booking.id}`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tenant/messages/new">Contact Support</Link>
              </Button>
              {['pending', 'confirmed'].includes(booking.status) && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelBooking}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
