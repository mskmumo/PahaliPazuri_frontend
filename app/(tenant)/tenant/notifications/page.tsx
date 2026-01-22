'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Notification } from '@/lib/types/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Track previous unread count for vibration
  const [prevUnreadCount, setPrevUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications and vibrate phone
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await notificationsApi.getUnreadCount();
        const newCount = response.data?.count || 0;

        // Vibrate if there are new unread notifications
        if (newCount > prevUnreadCount && prevUnreadCount > 0) {
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          fetchNotifications();
        }
        setPrevUnreadCount(newCount);
      } catch (err) {
        console.error('Notification polling failed:', err);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(pollInterval);
  }, [prevUnreadCount]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll();
      // Ensure we always set an array
      const notificationsData = response.data;
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load notifications');
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = () => {
    // Return appropriate icon based on notification type
    return <Bell className="h-5 w-5" />;
  };

  // Vibrate phone when new notifications arrive
  const vibratePhone = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibrate pattern: 200ms, pause 100ms, 200ms
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      booking_approved: 'text-blue-600',
      booking_confirmed: 'text-green-600',
      booking_cancelled: 'text-red-600',
      payment_received: 'text-green-600',
      payment_failed: 'text-red-600',
      maintenance_created: 'text-blue-600',
      maintenance_completed: 'text-green-600',
      message_received: 'text-purple-600',
    };
    return colors[type] || 'text-gray-600';
  };

  // Ensure notifications is always an array before filtering
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read_at;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tenant/notifications/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({safeNotifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({safeNotifications.filter(n => !n.read_at).length})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={!notification.read_at ? 'border-primary bg-blue-50/30' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={getNotificationColor(notification.data.type)}>
                    {getNotificationIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{notification.data.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
