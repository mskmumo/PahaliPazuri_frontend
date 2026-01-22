'use client';

import { useBookingNotifications } from '@/hooks/useBookingNotifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BookingNotificationBadge() {
  const { pendingCount, hasPermission, requestPermission, newBookings } = useBookingNotifications();
  const [showToast, setShowToast] = useState(false);

  // Show toast when new bookings arrive
  useEffect(() => {
    if (newBookings.length > 0) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [newBookings]);

  // Auto-request permission on mount if not granted
  useEffect(() => {
    if (!hasPermission && 'Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, []);

  return (
    <>
      <div className="relative cursor-pointer">
        {pendingCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse text-xs"
          >
            {pendingCount}
          </Badge>
        )}
        <Bell className={`h-6 w-6 ${pendingCount > 0 ? 'text-red-500 animate-bounce' : ''}`} />
      </div>

      {/* Toast Notification */}
      {showToast && newBookings.length > 0 && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-bounce" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">New Booking Request!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {newBookings[0].user_name} - Room {newBookings[0].room_number}
                </p>
                <a 
                  href={`/admin/bookings/${newBookings[0].id}`}
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  View Details →
                </a>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
