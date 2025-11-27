'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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

      // Check role if required
      if (requiredRole && user.role !== requiredRole) {
        // Redirect based on actual role
        if (user.role === 'admin' || user.role === 'super-admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'tenant') {
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
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
