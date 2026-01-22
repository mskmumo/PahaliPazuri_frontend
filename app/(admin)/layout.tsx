'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import BookingNotificationBadge from '@/components/admin/BookingNotificationBadge';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  DoorOpen, 
  Calendar, 
  Users, 
  CreditCard, 
  Wrench, 
  FileText,
  BarChart3,
  Settings,
  Bell,
  Ticket
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // Helper to get role slug
  const getUserRole = () => {
    if (!user) return undefined;
    return typeof user.role === 'string' ? user.role : user.role?.slug;
  };

  // Admin menu items
  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/apartments', label: 'Apartments', icon: Building2 },
    { href: '/admin/rooms', label: 'Rooms', icon: DoorOpen },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/tenants', label: 'Tenants', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/admin/support-tickets', label: 'Support Tickets', icon: Ticket },
    { href: '/admin/contacts', label: 'Contact Forms', icon: Bell },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    const userRole = getUserRole();
    
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && !isAdmin) {
      // Redirect non-admins to their appropriate dashboard
      if (userRole === 'tenant') {
        router.push('/tenant/dashboard');
      } else if (userRole === 'staff' || userRole === 'maintenance_staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isAdmin, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar menuItems={menuItems} user={user} />
      <main className="flex-1 ml-64 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your property business</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/admin/bookings">
                <BookingNotificationBadge />
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content Area - Full Width */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
