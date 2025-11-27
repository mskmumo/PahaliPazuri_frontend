'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import TenantSidebar from '@/components/layout/TenantSidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import Link from 'next/link';
import { Home, Calendar, CreditCard, Wrench, MessageSquare, FileText, Bell, User } from 'lucide-react';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, isTenant, isAdmin } = useAuth();
  const router = useRouter();

  // Helper to get role slug
  const getUserRole = () => {
    if (!user) return undefined;
    return typeof user.role === 'string' ? user.role : user.role?.slug;
  };

  useEffect(() => {
    const userRole = getUserRole();

    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && !isTenant) {
      // Redirect non-tenants to their appropriate dashboard
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (userRole === 'staff' || userRole === 'maintenance_staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isTenant, isAdmin, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !isTenant) {
    return null;
  }

  const menuItems = [
    { href: '/tenant/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tenant/bookings', label: 'My Bookings', icon: Calendar },
    { href: '/tenant/payments', label: 'Payments', icon: CreditCard },
    { href: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/tenant/messages', label: 'Messages', icon: MessageSquare },
    { href: '/tenant/documents', label: 'Documents', icon: FileText },
    { href: '/tenant/notifications', label: 'Notifications', icon: Bell },
    { href: '/tenant/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TenantSidebar menuItems={menuItems} user={user} />
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link href="/tenant/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
