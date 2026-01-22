'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Building2,
  Home,
  BedDouble,
  Info,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b border-border/40">
        <div className="container px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Icon */}
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">Pahali Pazuri</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/rooms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Rooms
            </Link>
            <Link
              href="/apartments"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Apartments
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link href={getDashboardUrl()}>
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" className="rounded-full px-4" asChild>
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden relative flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background hover:bg-accent transition-colors z-[60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Outside header for proper z-index stacking */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Dark Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Menu Panel */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm shadow-2xl overflow-hidden rounded-r-2xl bg-background animate-in slide-in-from-left duration-300">
            <div className="h-full flex flex-col overflow-y-auto">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0">
                <div className="flex items-center gap-3">
                  {/* Logo Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight text-foreground">Pahali Pazuri</span>
                    <span className="text-xs text-muted-foreground">Student Housing</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-muted hover:bg-accent transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-foreground font-medium bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <span>Home</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                <Link
                  href="/rooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-foreground font-medium bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Rooms</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                <Link
                  href="/apartments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-foreground font-medium bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span>Apartments</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-foreground font-medium bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Info className="w-5 h-5 text-amber-600" />
                    </div>
                    <span>About</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                {/* Divider */}
                <div className="my-3 border-t border-border" />

                {isAuthenticated ? (
                  <>
                    <Link
                      href={getDashboardUrl()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-foreground font-medium bg-muted/50 hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-violet-600" />
                        </div>
                        <span>Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-muted-foreground font-medium bg-muted/30 hover:bg-destructive/10 hover:text-destructive transition-colors w-full group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span>Sign out</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center rounded-xl h-12"
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button
                        size="lg"
                        className="w-full justify-center rounded-xl h-12"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>

              {/* Bottom Brand Section */}
              <div className="p-4 border-t border-border bg-muted/30 mt-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Now available in Nairobi
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
