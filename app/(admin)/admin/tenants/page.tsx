'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Eye, Users, Filter } from 'lucide-react';
import Link from 'next/link';
import { User as UserType } from '@/lib/types/api';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllTenants({
        search: searchQuery || undefined,
      });
      
      if (response.success && response.data) {
        setTenants(response.data);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Failed to load tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await adminApi.deleteTenant(id);
      fetchTenants();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete tenant');
    }
  };

  const filteredTenants = useMemo(() => {
    let filtered = tenants;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tenant) =>
          tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tenant.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter((tenant) => tenant.email_verified_at !== null);
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter((tenant) => tenant.email_verified_at === null);
      }
    }

    return filtered;
  }, [tenants, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tenants.length,
      verified: tenants.filter((t) => t.email_verified_at !== null).length,
      active: tenants.filter((t) => t.email_verified_at !== null).length, // Assuming verified = active
    };
  }, [tenants]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTenants} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground mt-2">Manage all tenants in the system</p>
        </div>
        <Button asChild>
          <Link href="/admin/tenants/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-3xl font-bold">{stats.verified}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-1">All tenants active</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Tenants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All ({tenants.length})
              </Button>
              <Button
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('verified')}
                size="sm"
              >
                Verified ({stats.verified})
              </Button>
              <Button
                variant={statusFilter === 'unverified' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('unverified')}
                size="sm"
              >
                Unverified ({stats.total - stats.verified})
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Showing <span className="font-semibold text-foreground">{filteredTenants.length}</span> of{' '}
            <span className="font-semibold text-foreground">{tenants.length}</span> tenants
          </p>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
              <p className="text-muted-foreground mb-6">
                {tenants.length === 0
                  ? 'No tenants have been added yet'
                  : 'No tenants match your search criteria'}
              </p>
              {tenants.length === 0 && (
                <Button asChild>
                  <Link href="/admin/tenants/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Tenant
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Tenant</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-semibold text-sm">
                              {tenant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {tenant.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{tenant.email}</div>
                          <div className="text-muted-foreground">{tenant.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={
                            tenant.gender === 'male'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : tenant.gender === 'female'
                              ? 'bg-pink-50 text-pink-700 border-pink-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {tenant.gender ? tenant.gender.charAt(0).toUpperCase() + tenant.gender.slice(1) : 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {tenant.email_verified_at ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unverified</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {new Date(tenant.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/tenants/${tenant.id}`}>
                            <Button variant="outline" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/tenants/${tenant.id}/edit`}>
                            <Button variant="outline" size="sm" title="Edit Tenant">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tenant.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Tenant"
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
