'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { roomsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { Bed, MapPin, Search, SlidersHorizontal } from 'lucide-react';

export default function RoomsPage() {
  const { data, loading, error, execute } = useApi(roomsApi.getAll);
  const [filters, setFilters] = useState({
    status: 'available',
    room_type: '',
    min_price: '',
    max_price: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadRooms = useCallback(() => {
    const params: any = { page: 1, per_page: 12, status: filters.status };
    if (filters.room_type) params.room_type = filters.room_type;
    if (filters.min_price) params.min_price = Number(filters.min_price);
    if (filters.max_price) params.max_price = Number(filters.max_price);
    execute(params);
  }, [execute, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSearch = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    );
    execute({ page: 1, per_page: 12, ...cleanFilters });
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Available Rooms</h1>
        <p className="text-muted-foreground">
          Find the perfect room that suits your needs and budget
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filter Rooms</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type</Label>
                <select
                  id="room_type"
                  aria-label="Filter by room type"
                  value={filters.room_type}
                  onChange={(e) =>
                    setFilters({ ...filters, room_type: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="one_bedroom">One Bedroom</option>
                  <option value="two_bedroom">Two Bedroom</option>
                  <option value="hostel_bed">Hostel Bed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_price">Min Price (KES)</Label>
                <Input
                  id="min_price"
                  type="number"
                  placeholder="5000"
                  value={filters.min_price}
                  onChange={(e) =>
                    setFilters({ ...filters, min_price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_price">Max Price (KES)</Label>
                <Input
                  id="max_price"
                  type="number"
                  placeholder="20000"
                  value={filters.max_price}
                  onChange={(e) =>
                    setFilters({ ...filters, max_price: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {loading && <LoadingSpinner size="lg" />}

      {error && (
        <ErrorMessage message={error.message || 'Failed to load rooms'} />
      )}

      {data && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {data.data.length} of {data.total} rooms
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.data.map((room) => {
              // Ensure amenities is always an array
              const amenities = Array.isArray(room.amenities) ? room.amenities : [];
              
              return (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
                    {room.images && room.images.length > 0 && room.images[0] ? (
                      <Image
                        src={room.images[0]}
                        alt={`Room ${room.room_number}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <Bed className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle>{room.room_number}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        room.status === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                  <CardDescription className="capitalize">
                    {room.room_type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(room.price_per_month || room.actual_price || 0)} / month
                    </div>
                    {room.apartment && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{room.apartment.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {room.floor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor:</span>
                        <span className="font-medium">{room.floor}</span>
                      </div>
                    )}
                    {room.size_sqm && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{room.size_sqm} sqm</span>
                      </div>
                    )}
                    {room.allowed_gender !== 'any' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium capitalize">
                          {room.allowed_gender}
                        </span>
                      </div>
                    )}
                    {room.total_beds && room.room_type === 'hostel_bed' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Beds:</span>
                        <span className="font-medium">
                          {room.available_beds} / {room.total_beds} available
                        </span>
                      </div>
                    )}
                  </div>

                  {amenities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                      {amenities.length > 3 && (
                        <span className="px-2 py-1 text-xs text-muted-foreground">
                          +{amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/rooms/${room.id}`}>View Details</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/rooms/${room.id}/book`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
            })}
          </div>

          {data.data.length === 0 && (
            <div className="text-center py-12">
              <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or check back later
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: 'available',
                    room_type: '',
                    min_price: '',
                    max_price: '',
                  });
                  execute({ page: 1, per_page: 12, status: 'available' });
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
