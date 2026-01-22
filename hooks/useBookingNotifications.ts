'use client';

import { useEffect, useRef, useState } from 'react';
import { adminApi } from '@/lib/api';

interface BookingNotification {
  id: number;
  user_name: string;
  room_number: string;
  created_at: string;
}

export function useBookingNotifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [newBookings, setNewBookings] = useState<BookingNotification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const previousCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === 'granted');
        });
      }
    }

    // Create audio element for notification sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // Fetch pending bookings
  const fetchPendingBookings = async () => {
    try {
      const response = await adminApi.bookings.getAll({ status: 'pending', per_page: 100 });
      // Handle PaginatedResponse structure
      const bookings = response.data || [];
      if (bookings.length >= 0) {
        setPendingCount(bookings.length);
        
        // Check if there are new bookings
        if (bookings.length > previousCountRef.current && previousCountRef.current > 0) {
          const newBookingsList = bookings.slice(0, bookings.length - previousCountRef.current);
          setNewBookings(newBookingsList.map((b: any) => ({
            id: b.id,
            user_name: b.user?.name || 'Unknown User',
            room_number: b.room?.room_number || 'N/A',
            created_at: b.created_at,
          })));
          
          // Trigger notification
          notifyNewBooking(newBookingsList[0]);
        }
        
        previousCountRef.current = bookings.length;
      }
    } catch (error) {
      console.error('Failed to fetch pending bookings:', error);
    }
  };

  // Trigger notification with vibration and sound
  const notifyNewBooking = (booking: any) => {
    // Vibrate (if supported)
    if ('vibrate' in navigator) {
      // Vibrate pattern: [vibrate, pause, vibrate, pause, vibrate]
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    // Show browser notification
    if (hasPermission && 'Notification' in window) {
      const notification = new Notification('New Booking Request!', {
        body: `${booking.user?.name || 'A guest'} booked ${booking.room?.room_number || 'a room'}`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `booking-${booking.id}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = `/admin/bookings/${booking.id}`;
        notification.close();
      };
    }
  };

  // Poll for new bookings every 30 seconds
  useEffect(() => {
    fetchPendingBookings(); // Initial fetch

    const interval = setInterval(() => {
      fetchPendingBookings();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [hasPermission]);

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      return permission === 'granted';
    }
    return hasPermission;
  };

  return {
    pendingCount,
    newBookings,
    hasPermission,
    requestPermission,
    refreshPendingCount: fetchPendingBookings,
  };
}
