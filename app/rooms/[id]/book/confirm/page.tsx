'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { enhancedBookingsApi } from '@/lib/api/bookings';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  MapPin, 
  User, 
  Phone, 
  CreditCard,
  ArrowLeft,
  Home,
  Bed,
  Clock
} from 'lucide-react';

interface BookingDetails {
  id: number;
  room?: {
    id: number;
    room_number: string;
    room_type: string;
    apartment?: {
      name: string;
      location: string;
    };
  };
  check_in_date: string;
  check_out_date: string;
  duration_months: number;
  total_amount: number;
  base_rent?: number;
  deposit_amount?: number;
  service_fee?: number;
  bed_number?: number | null;
  status: string;
  payment_status: string;
  created_at?: string;
  user?: {
    emergency_contact?: {
      name?: string;
      phone?: string;
    };
  };
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (bookingId) {
        fetchBooking();
      } else {
        setError('No booking ID provided');
        setLoading(false);
      }
    }
  }, [bookingId, isAuthenticated, authLoading]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await enhancedBookingsApi.getById(parseInt(bookingId!));
      if (response.success && response.data) {
        const data = response.data;
        setBooking({
          id: data.id,
          room: data.room ? {
            id: data.room.id,
            room_number: data.room.room_number,
            room_type: data.room.room_type,
            apartment: data.room.apartment ? {
              name: data.room.apartment.name,
              location: data.room.apartment.location
            } : undefined
          } : undefined,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          duration_months: data.duration_months,
          total_amount: data.total_amount,
          base_rent: data.base_rent,
          deposit_amount: data.deposit_amount,
          service_fee: data.service_fee,
          bed_number: data.bed_number,
          status: data.status,
          payment_status: data.payment_status,
          created_at: data.created_at,
          user: data.user
        });
      } else {
        setError('Failed to load booking details');
      }
    } catch (err: any) {
      console.error('Failed to fetch booking:', err);
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    // Redirect to payment page
    router.push(`/tenant/payments?booking_id=${bookingId}`);
  };

  const handlePayLater = () => {
    // Redirect to tenant dashboard
    router.push('/tenant/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorMessage message={error || 'Booking not found'} />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.push('/rooms')}>
                Browse Rooms
              </Button>
              <Button onClick={() => router.push('/tenant/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Created Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your booking has been created and is temporarily reserved. Please complete payment within 48 hours to confirm your reservation.
          </p>
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⏰ <strong>Important:</strong> This booking will be automatically cancelled if payment is not received within 48 hours.
            </p>
          </div>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Booking Details
            </CardTitle>
            <CardDescription>Booking ID: #{booking.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.room?.apartment?.name || 'Property'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.room?.apartment?.location || 'Location'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Bed className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Room {booking.room?.room_number || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.room?.room_type?.replace(/_/g, ' ') || 'Room'}
                      {booking.bed_number && ` - Bed ${booking.bed_number}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Stay Duration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(booking.check_in_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-out</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(booking.check_out_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Duration: <strong>{booking.duration_months} months</strong>
              </p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Emergency Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Emergency Contact
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {booking.user?.emergency_contact?.name || 'Not provided'}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {booking.user?.emergency_contact?.phone || 'Not provided'}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.base_rent && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Base Rent ({booking.duration_months} months)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(booking.base_rent)}
                  </span>
                </div>
              )}
              
              {booking.deposit_amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Security Deposit (Refundable)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(booking.deposit_amount)}
                  </span>
                </div>
              )}
              
              {booking.service_fee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(booking.service_fee)}
                  </span>
                </div>
              )}

              <hr className="border-gray-200 dark:border-gray-700 my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(booking.total_amount)}
                </span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="mt-6 flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                Booking: {booking.status}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded-full text-sm">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Payment: {booking.payment_status === 'unpaid' ? 'pending' : booking.payment_status}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Next Steps: Complete Payment
            </CardTitle>
            <CardDescription>
              Your booking is pending payment confirmation. Choose an option below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={handlePayNow} 
                className="w-full h-12 text-lg"
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now to Confirm Booking
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">or</p>

              <Button 
                onClick={handlePayLater}
                variant="outline"
                className="w-full"
              >
                Pay Later (View in Dashboard)
              </Button>

              <div className="mt-4 space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 Booking Status: Pending Payment</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Your booking has been created and the room is temporarily reserved for you. 
                    Complete payment to confirm your reservation.
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">⏰ Payment Deadline</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    <strong>You have 48 hours</strong> from now to complete payment. After this time, 
                    your booking will be automatically cancelled and the room will be available for others.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">
                    Created: {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'Just now'}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">✅ What happens after payment?</h4>
                  <ul className="text-sm text-green-800 dark:text-green-400 space-y-1 list-disc list-inside">
                    <li>Your booking status changes to "Confirmed"</li>
                    <li>The room is officially reserved for your dates</li>
                    <li>You'll receive a confirmation email</li>
                    <li>You can view your booking in the dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/tenant/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tenant/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              View All Bookings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/rooms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse More Rooms
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
