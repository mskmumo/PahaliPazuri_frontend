'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { NotificationPreferences } from '@/lib/types/api';

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultPreferences = (): NotificationPreferences => ({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    booking_updates: true,
    payment_reminders: true,
    maintenance_updates: true,
    promotional_emails: false,
  });

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getPreferences();
      setPreferences(response.data || getDefaultPreferences());
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationsApi.updatePreferences(preferences);
      alert('Preferences saved successfully!');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

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

  const settings = [
    { key: 'email_notifications' as const, label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'sms_notifications' as const, label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'push_notifications' as const, label: 'Push Notifications', description: 'Receive in-app notifications' },
    { key: 'booking_updates' as const, label: 'Booking Updates', description: 'Notifications about your bookings' },
    { key: 'payment_reminders' as const, label: 'Payment Reminders', description: 'Reminders for upcoming payments' },
    { key: 'maintenance_updates' as const, label: 'Maintenance Updates', description: 'Updates on maintenance requests' },
    { key: 'promotional_emails' as const, label: 'Promotional Emails', description: 'Receive promotional content' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tenant/notifications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive notifications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified for different events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex-1">
                <h3 className="font-semibold">{setting.label}</h3>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={setting.key}
                  checked={preferences?.[setting.key] || false}
                  onChange={() => handleToggle(setting.key)}
                  className="h-4 w-4 rounded border-gray-300"
                  aria-label={setting.label}
                />
                <Label htmlFor={setting.key} className="cursor-pointer sr-only">
                  {setting.label}
                </Label>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tenant/notifications">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
