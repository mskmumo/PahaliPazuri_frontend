'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { paymentsApi, bookingsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import MpesaPaymentForm from '@/components/payments/MpesaPaymentForm';
import type { Payment, Booking } from '@/lib/types/api';

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking_id');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidBookings, setUnpaidBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (bookingIdParam && unpaidBookings.length > 0) {
      const booking = unpaidBookings.find(b => b.id === parseInt(bookingIdParam));
      if (booking) {
        setSelectedBooking(booking);
        setShowPaymentForm(true);
      }
    }
  }, [bookingIdParam, unpaidBookings]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings first
      const bookingsRes = await bookingsApi.getUserBookings();
      const bookings = bookingsRes.data || [];
      
      // Fetch payments for all bookings
      const paymentPromises = bookings.map((b: Booking) => 
        paymentsApi.getByBookingId(b.id).catch(() => ({ data: [] }))
      );
      const paymentResults = await Promise.all(paymentPromises);
      const allPayments = paymentResults.flatMap(r => r.data || []);
      
      setPayments(allPayments);
      
      const unpaid = bookings.filter((b: Booking) => 
        b.payment_status !== 'paid' && ['pending', 'confirmed', 'approved', 'active'].includes(b.status)
      );
      setUnpaidBookings(unpaid);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage your payments and transaction history</p>
      </div>

      <Tabs defaultValue={showPaymentForm ? 'make-payment' : 'history'} className="space-y-6">
        <TabsList>
          <TabsTrigger value="make-payment">Make Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="make-payment" className="space-y-6">
          {/* Unpaid Bookings */}
          {unpaidBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any pending payments at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Pending Payments</h3>
                {unpaidBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Booking #{booking.id}</CardTitle>
                          <CardDescription>
                            Room {booking.room?.room_number} - {booking.room?.apartment?.name}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusBadge(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            KES {booking.total_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total amount due
                          </p>
                        </div>
                        <Button onClick={() => {
                          setSelectedBooking(booking);
                          setShowPaymentForm(true);
                        }}>
                          Pay Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Form */}
              {showPaymentForm && selectedBooking && (
                <Card>
                  <CardHeader>
                    <CardTitle>Make Payment</CardTitle>
                    <CardDescription>
                      Choose your preferred payment method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MpesaPaymentForm 
                      booking={selectedBooking}
                      onSuccess={() => {
                        setShowPaymentForm(false);
                        setSelectedBooking(null);
                        fetchData();
                      }}
                      onCancel={() => {
                        setShowPaymentForm(false);
                        setSelectedBooking(null);
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
                  <p className="text-muted-foreground">
                    You haven&apos;t made any payments yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-semibold">
                            KES {payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Transaction ID: {payment.transaction_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Method: {payment.payment_method.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                        {payment.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
