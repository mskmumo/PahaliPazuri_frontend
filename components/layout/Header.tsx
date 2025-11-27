'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  User, 
  LogOut, 
  Menu,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout, isAdmin, isTenant } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to get role slug
  const getUserRole = () => {
    if (!user) return undefined;
    return typeof user.role === 'string' ? user.role : user.role?.slug;
  };

  // Get role-specific dashboard URL
  const getDashboardUrl = () => {
    const userRole = getUserRole();
    if (isAdmin) return '/admin/dashboard';
    if (isTenant) return '/tenant/dashboard';
    if (userRole === 'staff' || userRole === 'maintenance_staff') return '/staff/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Pahali Pazuri</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/apartments" className="transition-colors hover:text-primary">
            Apartments
          </Link>
          <Link href="/rooms" className="transition-colors hover:text-primary">
            Rooms
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            About
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>

              {/* Messages */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/messages">
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </Button>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={getDashboardUrl()}>
                    <User className="mr-2 h-4 w-4" />
                    {user?.name}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col space-y-3">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/apartments" className="text-sm font-medium hover:text-primary">
              Apartments
            </Link>
            <Link href="/rooms" className="text-sm font-medium hover:text-primary">
              Rooms
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href={getDashboardUrl()} className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium hover:text-primary text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-medium hover:text-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
