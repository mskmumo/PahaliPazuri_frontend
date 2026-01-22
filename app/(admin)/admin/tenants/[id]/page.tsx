'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types/api';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = parseInt(params.id as string);

  const [tenant, setTenant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tenant from backend
      const response = await adminApi.getTenant(tenantId);
      
      if (response.success && response.data) {
        setTenant(response.data);
      } else {
        setError('Failed to load tenant data');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Failed to load tenant');
      console.error('Error fetching tenant:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  if (loading) return <LoadingSpinner />;
  
  if (error || !tenant) {
    return <ErrorMessage message={error || 'Tenant not found'} onRetry={fetchTenant} />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back button */}
      <Link 
        href="/admin/tenants"
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to tenants
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">{tenant.name}</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">Active</Badge>
        </div>
        <Link href={`/admin/tenants/${tenant.id}/edit`}>
          <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            Edit Tenant
          </Button>
        </Link>
      </div>

      {/* Contact Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-background">
          <CardTitle className="text-2xl font-bold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{tenant.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">{tenant.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Member Since</p>
                <p className="font-semibold text-gray-900">{new Date(tenant.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-background">
          <CardTitle className="text-2xl font-bold">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-blue-700 mb-2">Total Bookings</p>
              <p className="text-4xl font-black text-blue-600">3</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200 hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-green-700 mb-2">Total Payments</p>
              <p className="text-4xl font-black text-green-600">KES 45K</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-6 rounded-2xl border border-yellow-200 hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-yellow-700 mb-2">Maintenance Requests</p>
              <p className="text-4xl font-black text-yellow-600">2</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-background">
          <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <span className="text-base font-semibold">View Bookings</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <span className="text-base font-semibold">View Payments</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <span className="text-base font-semibold">View Maintenance</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <span className="text-base font-semibold">Send Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
