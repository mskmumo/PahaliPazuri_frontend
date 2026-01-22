'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Eye, Home, Bed, Filter } from 'lucide-react';
import Link from 'next/link';
import { Room } from '@/lib/types/api';
import { roomsApi } from '@/lib/api/rooms';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        const response = await roomsApi.getAll();
        setRooms(response.data || []);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground text-lg">Manage all rooms and availability</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Available</p>
                <p className="text-3xl font-bold text-green-600">
                  {rooms.filter((r) => r.status === 'available').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Home className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Occupied</p>
                <p className="text-3xl font-bold text-blue-600">
                  {rooms.filter((r) => r.status === 'occupied').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Maintenance</p>
                <p className="text-3xl font-bold text-red-600">
                  {rooms.filter((r) => r.status === 'maintenance').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Home className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Rooms</p>
                <p className="text-3xl font-bold text-purple-600">{rooms.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              aria-label="Filter rooms by status"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredRooms.length}</span> of <span className="font-semibold text-foreground">{rooms.length}</span> rooms
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Add your first room to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-4 px-4 font-semibold text-sm">Room Number</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Floor</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Beds</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Available</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Price/Month</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Gender</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm">Status</th>
                    <th className="text-right py-4 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold">{room.room_number}</div>
                        <div className="text-xs text-muted-foreground">{room.room_code}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="capitalize">{room.room_type?.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground capitalize">{room.sharing_type}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{room.floor_number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{room.total_beds}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={room.available_beds > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {room.available_beds}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">
                          KES {(room.actual_price || room.price_per_month || 0).toLocaleString()}
                        </div>
                        {room.total_beds > 1 && (
                          <div className="text-xs text-muted-foreground">
                            {room.price_per_bed_month?.toLocaleString()} / bed
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {room.gender_type || room.allowed_gender}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/rooms/${room.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/rooms/${room.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
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

