'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Calendar,
  Users,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  BarChart3,
  LogOut
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  user: any;
}

export default function AdminSidebar({ menuItems, user }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900">Pahali Pazuri</h1>
          <p className="text-xs text-gray-500">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600 -ml-1 pl-4'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-purple-600" : "text-gray-400"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>


      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
