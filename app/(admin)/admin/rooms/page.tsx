'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { Room } from '@/lib/types/api';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Derive filtered rooms from rooms, searchQuery, and statusFilter
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.room_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  }, [rooms, searchQuery, statusFilter]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // TODO: Implement actual API call
        // const response = await adminApi.getAllRooms();
        
        // Mock data
        setTimeout(() => {
          const mockRooms: Room[] = [
            {
              id: 5,
              apartment_id: 1,
              room_number: 'R-101',
              room_type: 'single',
              base_price: 15000,
              actual_price: 15000,
              description: null,
              floor: 1,
              amenities: [],
              images: [],
              status: 'occupied',
              available_beds: 0,
              total_beds: 1,
              allowed_gender: 'any',
              has_private_bathroom: true,
              has_kitchen: false,
              is_furnished: true,
              size_sqm: null,
              condition: 'good',
              last_maintenance_date: null,
              view_quality: 'good',
              noise_level: 'moderate',
              natural_light: 'good',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
            {
              id: 6,
              apartment_id: 1,
              room_number: 'R-102',
              room_type: 'double',
              base_price: 12000,
              actual_price: 12000,
              description: null,
              floor: 1,
              amenities: [],
              images: [],
              status: 'available',
              available_beds: 2,
              total_beds: 2,
              allowed_gender: 'any',
              has_private_bathroom: true,
              has_kitchen: false,
              is_furnished: true,
              size_sqm: null,
              condition: 'good',
              last_maintenance_date: null,
              view_quality: 'good',
              noise_level: 'moderate',
              natural_light: 'good',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z',
            },
          ];
          setRooms(mockRooms);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-2">Manage all rooms and their availability</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filter rooms by status"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </p>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No rooms found</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{room.room_number}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{room.room_type}</p>
                  </div>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Beds:</span>
                    <span className="font-medium">{room.total_beds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{room.available_beds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-medium">KES {room.actual_price.toLocaleString()}</span>
                  </div>
                </div>

                <Link href={`/admin/rooms/${room.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Room
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
