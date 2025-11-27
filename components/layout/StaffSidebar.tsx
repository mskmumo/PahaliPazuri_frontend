'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Wrench, 
  CheckCircle,
  Clock,
  MessageSquare, 
  User,
  LogOut
} from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StaffSidebarProps {
  menuItems: MenuItem[];
  user: any;
}

export default function StaffSidebar({ menuItems, user }: StaffSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    // Logout handled by parent
    window.location.href = '/';
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-600 to-orange-700 text-white flex flex-col">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-orange-800">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Wrench className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Pahali Pazuri</h1>
          <p className="text-xs text-orange-200">Staff Portal</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-orange-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.name || 'Staff Member'}</p>
            <p className="text-xs text-orange-200 truncate">{user?.email || ''}</p>
          </div>
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-orange-100 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-orange-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-orange-100 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
