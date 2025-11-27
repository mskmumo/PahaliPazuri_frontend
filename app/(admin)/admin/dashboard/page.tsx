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
  const [stats, setStats] = useState<DashboardStats>({
    tenants: { total: 0, active: 0, inactive: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, active: 0 },
    maintenance: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    payments: { totalRevenue: 0, pendingPayments: 0, paidThisMonth: 0 },
    occupancy: { totalRooms: 0, occupiedRooms: 0, availableRooms: 0, occupancyRate: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API calls when admin endpoints are ready
        // const response = await adminApi.getDashboardStats();
        
        // Mock data for now
        setTimeout(() => {
          setStats({
            tenants: { total: 45, active: 42, inactive: 3 },
            bookings: { total: 68, pending: 5, confirmed: 8, active: 55 },
            maintenance: { total: 23, pending: 7, inProgress: 9, completed: 7 },
            payments: { totalRevenue: 2450000, pendingPayments: 8, paidThisMonth: 1850000 },
            occupancy: { totalRooms: 60, occupiedRooms: 52, availableRooms: 8, occupancyRate: 86.7 },
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Pahali Pazuri Management System</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tenants */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{stats.tenants.total}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.tenants.active} active
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.bookings.total}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.bookings.pending} pending approval
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{stats.maintenance.total}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.maintenance.pending} pending
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  KES {(stats.payments.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{(stats.payments.paidThisMonth / 1000).toFixed(0)}K this month
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Room Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.occupancy.occupancyRate}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${clampedOccupancyRate}%` } as React.CSSProperties}
                  aria-hidden="true"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.occupancy.totalRooms}</p>
                  <p className="text-xs text-gray-600">Total Rooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.occupancy.occupiedRooms}</p>
                  <p className="text-xs text-gray-600">Occupied</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.occupancy.availableRooms}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bookings */}
              <Link href="/admin/bookings" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Pending Bookings</p>
                      <p className="text-sm text-gray-600">Requires approval</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{stats.bookings.pending}</Badge>
                </div>
              </Link>

              {/* Maintenance */}
              <Link href="/admin/maintenance" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Pending Maintenance</p>
                      <p className="text-sm text-gray-600">Needs assignment</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">{stats.maintenance.pending}</Badge>
                </div>
              </Link>

              {/* Payments */}
              <Link href="/admin/payments" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pending Payments</p>
                      <p className="text-sm text-gray-600">Awaiting confirmation</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{stats.payments.pendingPayments}</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/tenants"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">Manage Tenants</p>
            </Link>
            
            <Link 
              href="/admin/bookings"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-center"
            >
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">View Bookings</p>
            </Link>
            
            <Link 
              href="/admin/maintenance"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-center"
            >
              <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">Assign Tasks</p>
            </Link>
            
            <Link 
              href="/admin/reports"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-center"
            >
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">View Reports</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
