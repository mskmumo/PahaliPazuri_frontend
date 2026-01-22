'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, Wrench, MessageSquare, Bell } from 'lucide-react';
import Link from 'next/link';
import { enhancedBookingsApi } from '@/lib/api/bookings';
import { paymentsApi, maintenanceApi, notificationsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Booking, Payment, MaintenanceRequest, Notification } from '@/lib/types/api';

interface DashboardStats {
  activeBookings: number;
  upcomingPayments: number;
  openMaintenanceRequests: number;
  unreadNotifications: number;
}

export default function TenantDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    upcomingPayments: 0,
    openMaintenanceRequests: 0,
    unreadNotifications: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel with individual error handling
      const [bookingsRes, maintenanceRes, notificationsRes] = await Promise.allSettled([
        enhancedBookingsApi.getMyBookings(),
        maintenanceApi.getMyRequests(),
        notificationsApi.getAll(),
      ]);

      // Extract data from settled promises with proper array handling
      const bookings = bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data) 
        ? bookingsRes.value.data 
        : [];
      const maintenance = maintenanceRes.status === 'fulfilled' && Array.isArray(maintenanceRes.value.data)
        ? maintenanceRes.value.data
        : [];
      const notifications = notificationsRes.status === 'fulfilled' && Array.isArray(notificationsRes.value.data)
        ? notificationsRes.value.data
        : [];

      // Calculate stats
      setStats({
        activeBookings: Array.isArray(bookings) ? bookings.filter((b: Booking) => 
          ['confirmed', 'approved', 'active'].includes(b.status)
        ).length : 0,
        upcomingPayments: Array.isArray(bookings) ? bookings.filter((b: Booking) => 
          b.payment_status === 'pending' || b.payment_status === 'partial'
        ).length : 0,
        openMaintenanceRequests: Array.isArray(maintenance) ? maintenance.filter((m: MaintenanceRequest) => 
          ['pending', 'assigned', 'in_progress'].includes(m.status)
        ).length : 0,
        unreadNotifications: Array.isArray(notifications) ? notifications.filter((n: Notification) => !n.read_at).length : 0,
      });

      // Set recent items (top 5)
      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
      
      // Fetch payments for recent bookings
      if (Array.isArray(bookings) && bookings.length > 0) {
        try {
          const recentBookingIds = bookings.slice(0, 5).map((b: Booking) => b.id);
          const paymentPromises = recentBookingIds.map((id: number) => 
            paymentsApi.getByBookingId(id).catch(() => ({ data: [] }))
          );
          const paymentResults = await Promise.all(paymentPromises);
          const allPayments = paymentResults.flatMap(r => r.data || []);
          setRecentPayments(allPayments.slice(0, 5));
        } catch (err) {
          console.error('Failed to fetch payments:', err);
          setRecentPayments([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Don't show error if we have partial data - graceful degradation
      if (process.env.NODE_ENV === 'development') {
        console.warn('Dashboard loaded with limited data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Removed error state blocking - now shows dashboard with partial data

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current reservations
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/tenant/bookings">View all →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/tenant/payments">Pay now →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openMaintenanceRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Open requests
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/tenant/maintenance">View requests →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unread messages
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/tenant/notifications">View all →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest reservations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No bookings yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/rooms">Browse available rooms</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Room {booking.room?.room_number || booking.room_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        booking.status === 'active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tenant/bookings">View All Bookings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tenant/payments">View All Payments</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/rooms">
                <Calendar className="h-6 w-6" />
                <span>Book a Room</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/tenant/maintenance/new">
                <Wrench className="h-6 w-6" />
                <span>Request Maintenance</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/tenant/messages/new">
                <MessageSquare className="h-6 w-6" />
                <span>Send Message</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
