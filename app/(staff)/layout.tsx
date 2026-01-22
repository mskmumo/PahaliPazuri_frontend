'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import StaffSidebar from '@/components/layout/StaffSidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wrench, 
  CheckCircle,
  Clock,
  MessageSquare, 
  User,
  Bell 
} from 'lucide-react';

export default function StaffLayout({
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

  const userRole = getUserRole();
  const isStaff = userRole === 'staff' || userRole === 'maintenance_staff';

  // Staff menu items
  const menuItems = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/staff/assignments', label: 'My Assignments', icon: Wrench },
    { href: '/staff/pending', label: 'Pending Tasks', icon: Clock },
    { href: '/staff/completed', label: 'Completed', icon: CheckCircle },
    { href: '/staff/messages', label: 'Messages', icon: MessageSquare },
    { href: '/staff/profile', label: 'Profile', icon: User },
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && !isStaff && !isAdmin) {
      // Redirect non-staff to their appropriate dashboard
      if (userRole === 'tenant') {
        router.push('/tenant/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isStaff, isAdmin, userRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || (!isStaff && !isAdmin)) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar menuItems={menuItems} user={user} />
      <main className="flex-1 ml-64 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff Portal</h1>
              <p className="text-sm text-muted-foreground">Manage maintenance requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link href="/staff/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
