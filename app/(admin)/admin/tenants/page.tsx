'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types/api';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await adminApi.getTenants();
      
      // Mock data
      setTimeout(() => {
        const mockTenants: User[] = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+254712345678',
            gender: 'male',
            id_number: null,
            date_of_birth: null,
            role: 'tenant',
            email_verified_at: null,
            notification_preferences: {
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              booking_updates: true,
              payment_reminders: true,
              maintenance_updates: true,
              promotional_emails: false,
            },
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+254723456789',
            gender: 'female',
            id_number: null,
            date_of_birth: null,
            role: 'tenant',
            email_verified_at: null,
            notification_preferences: {
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              booking_updates: true,
              payment_reminders: true,
              maintenance_updates: true,
              promotional_emails: false,
            },
            created_at: '2024-01-20T10:00:00Z',
            updated_at: '2024-01-20T10:00:00Z',
          },
        ];
        setTenants(mockTenants);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setLoading(false);
    }
    };

    fetchTenants();
  }, []);

  // Compute filtered tenants - no need for useEffect or separate state
  const filteredTenants = tenants.filter((tenant) => {
    if (!searchQuery) return true;
    
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const refetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await adminApi.getTenants();
      
      // Mock data
      setTimeout(() => {
        const mockTenants: User[] = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+254712345678',
            gender: 'male',
            id_number: null,
            date_of_birth: null,
            role: 'tenant',
            email_verified_at: null,
            notification_preferences: {
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              booking_updates: true,
              payment_reminders: true,
              maintenance_updates: true,
              promotional_emails: false,
            },
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+254723456789',
            gender: 'female',
            id_number: null,
            date_of_birth: null,
            role: 'tenant',
            email_verified_at: null,
            notification_preferences: {
              email_notifications: true,
              sms_notifications: true,
              push_notifications: true,
              booking_updates: true,
              payment_reminders: true,
              maintenance_updates: true,
              promotional_emails: false,
            },
            created_at: '2024-01-20T10:00:00Z',
            updated_at: '2024-01-20T10:00:00Z',
          },
        ];
        setTenants(mockTenants);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      // TODO: Implement delete API call
      // await adminApi.deleteTenant(id);
      console.log('Deleting tenant:', id);
      alert('Tenant deleted successfully');
      refetchTenants();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      alert('Failed to delete tenant');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600 mt-2">Manage all tenants in the system</p>
        </div>
        <Link href="/admin/tenants/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredTenants.length} of {tenants.length} tenants
        </p>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tenants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{tenant.name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {tenant.email}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {tenant.phone || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/tenants/${tenant.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/tenants/${tenant.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tenant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
