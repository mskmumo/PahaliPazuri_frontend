'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserRoleSlug } from '@/lib/utils/role-helpers';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'maintenance_staff' | 'tenant';
  fallbackUrl?: string;
}

export function AuthGuard({ children, requiredRole, fallbackUrl = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // No user, redirect to login
      if (!user) {
        router.push(fallbackUrl);
        return;
      }

      // Get role slug to handle both string and object formats
      const userRole = getUserRoleSlug(user);

      // Check role if required
      if (requiredRole && userRole !== requiredRole) {
        // Redirect based on actual role
        if (userRole === 'admin' || userRole === 'super-admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'tenant') {
          router.push('/tenant/dashboard');
        } else {
          router.push(fallbackUrl);
        }
      }
    }
  }, [user, loading, requiredRole, router, fallbackUrl]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  const userRole = getUserRoleSlug(user);
  if (!user || (requiredRole && userRole !== requiredRole)) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
