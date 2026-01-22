'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Calendar, 
  Wrench, 
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  tenants: {
    total: number;
    active: number;
    inactive: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    active: number;
  };
  maintenance: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  payments: {
    totalRevenue: number;
    pendingPayments: number;
    paidThisMonth: number;
  };
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
  };
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    tenants: { total: 0, active: 0, inactive: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, active: 0 },
    maintenance: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    payments: { totalRevenue: 0, pendingPayments: 0, paidThisMonth: 0 },
    occupancy: { totalRooms: 0, occupiedRooms: 0, availableRooms: 0, occupancyRate: 0 },
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await adminApi.getDashboardStats();
        
        // Mock data
        setTimeout(() => {
          setStats({
            tenants: { total: 45, active: 42, inactive: 3 },
            bookings: { total: 68, pending: 5, confirmed: 15, active: 48 },
            maintenance: { total: 23, pending: 7, inProgress: 8, completed: 8 },
            payments: { totalRevenue: 2450000, pendingPayments: 8, paidThisMonth: 1850000 },
            occupancy: { totalRooms: 60, occupiedRooms: 52, availableRooms: 8, occupancyRate: 86.7 },
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const rawOccupancyRate = Number(stats.occupancy.occupancyRate);
  const clampedOccupancyRate = Number.isFinite(rawOccupancyRate)
    ? Math.min(100, Math.max(0, rawOccupancyRate))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tenants */}
        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Tenants</p>
                <p className="text-3xl font-bold text-purple-600">{stats.tenants.total}</p>
                <p className="text-xs text-green-600 font-medium">
                  {stats.tenants.active} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600">{stats.bookings.total}</p>
                <p className="text-xs text-yellow-600 font-medium">
                  {stats.bookings.pending} pending
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Maintenance</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.maintenance.total}</p>
                <p className="text-xs text-orange-600 font-medium">
                  {stats.maintenance.pending} pending
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  KES {(stats.payments.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600 font-medium">
                  +{(stats.payments.paidThisMonth / 1000).toFixed(0)}K this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Room Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                <span className="text-3xl font-bold text-purple-600">
                  {stats.occupancy.occupancyRate}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${clampedOccupancyRate}%` } as React.CSSProperties}
                  aria-hidden="true"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats.occupancy.totalRooms}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Rooms</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.occupancy.occupiedRooms}</p>
                  <p className="text-xs text-muted-foreground mt-1">Occupied</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.occupancy.availableRooms}</p>
                  <p className="text-xs text-muted-foreground mt-1">Available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Bookings */}
              <Link href="/admin/bookings" className="block p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pending Bookings</p>
                      <p className="text-sm text-muted-foreground">Requires approval</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">{stats.bookings.pending}</Badge>
                </div>
              </Link>

              {/* Maintenance */}
              <Link href="/admin/maintenance" className="block p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pending Maintenance</p>
                      <p className="text-sm text-muted-foreground">Needs assignment</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-3 py-1">{stats.maintenance.pending}</Badge>
                </div>
              </Link>

              {/* Payments */}
              <Link href="/admin/payments" className="block p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pending Payments</p>
                      <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-lg px-3 py-1">{stats.payments.pendingPayments}</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/tenants"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 group-hover:bg-purple-200 mx-auto mb-3 flex items-center justify-center transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-semibold text-sm">Manage Tenants</p>
            </Link>
            
            <Link 
              href="/admin/bookings"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-200 mx-auto mb-3 flex items-center justify-center transition-colors">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold text-sm">View Bookings</p>
            </Link>
            
            <Link 
              href="/admin/maintenance"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-full bg-yellow-100 group-hover:bg-yellow-200 mx-auto mb-3 flex items-center justify-center transition-colors">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="font-semibold text-sm">Assign Tasks</p>
            </Link>
            
            <Link 
              href="/admin/reports"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 group-hover:bg-green-200 mx-auto mb-3 flex items-center justify-center transition-colors">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-sm">View Reports</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

