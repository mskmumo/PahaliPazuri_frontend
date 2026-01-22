'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types/api';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

export default function TenantEditPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.id as string);

  const [tenant, setTenant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    id_number: '',
    date_of_birth: '',
    password: '',
  });

  const fetchTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getTenant(tenantId);

      if (response.success && response.data) {
        setTenant(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          gender: response.data.gender || '',
          id_number: response.data.id_number || '',
          date_of_birth: response.data.date_of_birth || '',
          password: '',
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare data - only include fields that have values
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.gender) updateData.gender = formData.gender;
      if (formData.id_number) updateData.id_number = formData.id_number;
      if (formData.date_of_birth) updateData.date_of_birth = formData.date_of_birth;
      if (formData.password) updateData.password = formData.password;

      const response = await adminApi.updateTenant(tenantId, updateData);

      if (response.success) {
        alert('Tenant updated successfully!');
        router.push(`/admin/tenants/${tenantId}`);
      } else {
        setError('Failed to update tenant');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; errors?: any } }; message?: string };
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to update tenant');
      }
      console.error('Error updating tenant:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !tenant) {
    return <ErrorMessage message={error || 'Tenant not found'} onRetry={fetchTenant} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/admin/tenants/${tenantId}`}
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to tenant details
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Tenant</h1>
        <p className="text-muted-foreground mt-2">Update tenant information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                🔒 Email cannot be changed (contact super-admin if needed)
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+254712345678"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                name="id_number"
                type="text"
                value={formData.id_number}
                onChange={handleInputChange}
                placeholder="Enter ID number"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password change restricted"
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-sm text-amber-600 flex items-center gap-2">
                🔒 <span>Password changes restricted to super-admin for security</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/tenants/${tenantId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
