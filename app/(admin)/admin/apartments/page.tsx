'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Apartment } from '@/lib/types/api';

export default function AdminApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Derive filtered apartments from apartments and searchQuery using useMemo
  const filteredApartments = useMemo(() => {
    if (!searchQuery) {
      return apartments;
    }

    return apartments.filter((apt) =>
      apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apartments, searchQuery]);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Actual API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/apartments`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch apartments');
        }

        const data = await response.json();
        setApartments(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch apartments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load apartments');
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading apartments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apartment Management</h1>
          <p className="text-gray-600 mt-2">Manage all apartment buildings</p>
        </div>
        <Link href="/admin/apartments/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Apartment
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or address..."
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
          Showing {filteredApartments.length} of {apartments.length} apartments
        </p>
      </div>

      {/* Apartments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApartments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No apartments found</p>
          </div>
        ) : (
          filteredApartments.map((apartment) => (
            <Card key={apartment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">{apartment.name}</CardTitle>
                      <p className="text-sm text-gray-600">{apartment.address}</p>
                      <p className="text-xs text-gray-500">{apartment.location}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{apartment.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Floors</p>
                    <p className="text-2xl font-bold">{apartment.total_floors}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${apartment.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-lg font-bold ${apartment.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                      {apartment.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {apartment.total_rooms && apartment.available_rooms !== undefined && (
                  <div className="mb-4">
                    <Badge variant="outline">
                      Occupancy: {Math.round(((apartment.total_rooms - apartment.available_rooms) / apartment.total_rooms) * 100)}%
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Link href={`/admin/apartments/${apartment.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
