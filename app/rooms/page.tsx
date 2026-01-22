'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { roomsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import {
  Bed,
  MapPin,
  Search,
  SlidersHorizontal,
  Bath,
  Eye
} from 'lucide-react';

interface Room {
  id: number;
  room_number: string;
  floor?: number;
  floor_number?: number;
  room_type: string;
  status: string;
  base_price?: number;
  price_per_month?: number;
  total_beds?: number;
  occupied_beds?: number;
  apartment?: {
    id: number;
    name: string;
  };
  images?: string[];
}

interface GroupedRooms {
  [apartmentName: string]: {
    [floorNumber: number]: Room[];
  };
}

function RoomsPageContent() {
  const searchParams = useSearchParams();
  const apartmentIdFromUrl = searchParams.get('apartment_id');
  const apartmentNameFromUrl = searchParams.get('apartment_name');

  const { data, loading, error, execute } = useApi(roomsApi.getAll);
  const [filters, setFilters] = useState({
    status: '',
    room_type: '',
    min_price: '',
    max_price: '',
    apartment_id: apartmentIdFromUrl || '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState<string>(apartmentNameFromUrl || '');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'room_number' | 'availability'>('availability');

  const loadRooms = useCallback(() => {
    const params: Record<string, string | number> = { page: 1, per_page: 100 };
    if (filters.status) params.status = filters.status;
    if (filters.room_type) params.room_type = filters.room_type;
    if (filters.min_price) params.min_price = Number(filters.min_price);
    if (filters.max_price) params.max_price = Number(filters.max_price);
    if (filters.apartment_id) params.apartment_id = Number(filters.apartment_id);
    execute(params);
  }, [execute, filters]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSearch = () => {
    loadRooms();
  };

  // Group rooms by apartment and floor
  const groupedRooms: GroupedRooms = {};
  if (data?.data) {
    data.data.forEach((room) => {
      const apartmentName = room.apartment?.name || 'Unknown Apartment';
      const floorNumber = room.floor_number || 0;

      if (!groupedRooms[apartmentName]) {
        groupedRooms[apartmentName] = {};
      }
      if (!groupedRooms[apartmentName][floorNumber]) {
        groupedRooms[apartmentName][floorNumber] = [];
      }
      groupedRooms[apartmentName][floorNumber].push(room);
    });
  }

  // Get unique apartments and floors
  const apartments = Object.keys(groupedRooms);
  const activeApartment = selectedApartment || apartments[0];
  const floors = activeApartment && groupedRooms[activeApartment]
    ? Object.keys(groupedRooms[activeApartment]).map(Number).sort((a, b) => b - a)
    : [];

  const getFloorName = (floorNum: number) => {
    const floorNames: { [key: number]: string } = {
      0: 'Ground Floor',
      1: '1st Floor',
      2: '2nd Floor',
      3: '3rd Floor',
      4: '4th Floor',
      5: '5th Floor',
    };
    return floorNames[floorNum] || `${floorNum}th Floor`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
      case 'occupied':
        return <Badge variant="destructive">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      case 'reserved':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Reserved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Browse Rooms
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {apartmentNameFromUrl ? (
                <>Showing available rooms in <span className="font-semibold text-primary">{apartmentNameFromUrl}</span></>
              ) : (
                <>Discover your perfect space. Modern gallery view with rooms organized by floor and apartment.</>
              )}
            </p>
            {apartmentNameFromUrl && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, apartment_id: '' }));
                    setSelectedApartment('');
                    window.history.pushState({}, '', '/rooms');
                    loadRooms();
                  }}
                  className="text-xs"
                >
                  View All Apartments
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <Card className="mb-8 shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filter & Sort
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Find exactly what you&apos;re looking for</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hover:bg-primary/10"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
                  <select
                    id="status"
                    aria-label="Filter by status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_type" className="text-sm font-semibold">Room Type</Label>
                  <select
                    id="room_type"
                    aria-label="Filter by room type"
                    value={filters.room_type}
                    onChange={(e) =>
                      setFilters({ ...filters, room_type: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50"
                  >
                    <option value="">All Types</option>
                    <option value="private">Private</option>
                    <option value="shared_dorm">Shared Dorm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment" className="text-sm font-semibold">Apartment</Label>
                  <select
                    id="apartment"
                    aria-label="Filter by apartment"
                    value={selectedApartment}
                    onChange={(e) => setSelectedApartment(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50"
                  >
                    {apartments.map((apt) => (
                      <option key={apt} value={apt}>{apt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-sm font-semibold">Floor</Label>
                  <select
                    id="floor"
                    aria-label="Filter by floor"
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50"
                  >
                    <option value="all">All Floors</option>
                    {floors.map((floor) => (
                      <option key={floor} value={floor}>{getFloorName(floor)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_by" className="text-sm font-semibold">Sort By</Label>
                  <select
                    id="sort_by"
                    aria-label="Sort rooms by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'room_number' | 'availability')}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50"
                  >
                    <option value="availability">Availability</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="room_number">Room Number</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full h-10 rounded-lg shadow-md hover:shadow-lg transition-all">
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

        {data && apartments.length > 0 && (
          <>
            {/* Floor Gallery Grids */}
            <div className="space-y-10">
              {floors
                .filter((floor) => selectedFloor === 'all' || selectedFloor === floor)
                .map((floor) => {
                  let floorRooms = groupedRooms[activeApartment][floor] || [];

                  // Apply sorting
                  floorRooms = [...floorRooms].sort((a, b) => {
                    switch (sortBy) {
                      case 'price_asc':
                        return (a.price_per_month || 0) - (b.price_per_month || 0);
                      case 'price_desc':
                        return (b.price_per_month || 0) - (a.price_per_month || 0);
                      case 'room_number':
                        return a.room_number.localeCompare(b.room_number);
                      case 'availability':
                        // Available first, then others
                        if (a.status === 'available' && b.status !== 'available') return -1;
                        if (a.status !== 'available' && b.status === 'available') return 1;
                        return 0;
                      default:
                        return 0;
                    }
                  });

                  return (
                    <Card key={floor} className="overflow-hidden shadow-xl border-primary/10">
                      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/50 border-b-2 border-primary/20 py-6">
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{getFloorName(floor)}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base px-4 py-1">
                              {floorRooms.filter(r => r.status === 'available').length} / {floorRooms.length} Available
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 bg-gradient-to-b from-background to-muted/10">
                        {/* Unified Grid Layout - Rooms + Washroom Together */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                          {/* Room Cards */}
                          {floorRooms.map((room) => (
                            <Card
                              key={room.id}
                              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50"
                            >
                              <Link href={`/rooms/${room.id}`} className="block">
                                <div className="relative">
                                  {/* Room Image - Compact */}
                                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 via-muted/50 to-muted/30 overflow-hidden relative">
                                    {room.images && Array.isArray(room.images) && room.images.length > 0 && room.images[0] ? (
                                      <Image
                                        src={room.images[0]}
                                        alt={`Room ${room.room_number}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                                        unoptimized
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    ) : null}
                                    {(!room.images || !Array.isArray(room.images) || room.images.length === 0 || !room.images[0]) && (
                                      <div className="flex items-center justify-center h-full">
                                        <Bed className="h-12 w-12 text-muted-foreground/20 group-hover:text-primary/30 transition-colors" />
                                      </div>
                                    )}

                                    {/* Compact Badges */}
                                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                                      {/* Room Number Badge */}
                                      <div className="bg-gray-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg">
                                        <span className="text-sm font-black">{room.room_number}</span>
                                      </div>

                                      {/* Status Badge - Compact */}
                                      <div className="text-xs">
                                        {getStatusBadge(room.status)}
                                      </div>
                                    </div>

                                    {/* Simple Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-[5]">
                                      <div className="text-white text-center">
                                        <Eye className="h-10 w-10 mx-auto mb-2 drop-shadow-lg" />
                                        <p className="text-sm font-bold drop-shadow-md">View Details</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Compact Button */}
                                  <div className="p-2 bg-gradient-to-b from-background to-muted/20">
                                    <div className="w-full py-2 text-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                                      View Details
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </Card>
                          ))}

                          {/* Washroom Card - Same Size as Room Cards */}
                          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer overflow-hidden rounded-xl bg-card border-2 border-cyan-500/50 hover:border-cyan-500">
                            <div className="relative">
                              {/* Washroom Image - Same Aspect Ratio as Rooms */}
                              <div className="aspect-[3/4] bg-gradient-to-br from-cyan-100 via-blue-100 to-sky-100 dark:from-cyan-900 dark:via-blue-900 dark:to-sky-900 overflow-hidden relative">
                                <Image
                                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"
                                  alt="Washroom"
                                  fill
                                  className="object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
                                  unoptimized
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />

                                {/* Compact Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                  <div className="bg-cyan-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg">
                                    <span className="text-sm font-black">Washroom</span>
                                  </div>
                                </div>

                                {/* Simple Hover Overlay */}
                                <div className="absolute inset-0 bg-cyan-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-[5]">
                                  <div className="text-white text-center">
                                    <Bath className="h-10 w-10 mx-auto mb-2 drop-shadow-lg" />
                                    <p className="text-sm font-bold drop-shadow-md">Shared Facilities</p>
                                  </div>
                                </div>
                              </div>

                              {/* Compact Info */}
                              <div className="p-2 bg-gradient-to-b from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/30 dark:to-blue-950/30">
                                <div className="text-center py-2">
                                  <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Washrooms</p>
                                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    End of corridor
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </>
        )}

        {/* Empty State */}
        {data && apartments.length === 0 && (
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="text-center py-16">
              <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Bed className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No rooms found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn&apos;t find any rooms matching your criteria. Try adjusting your filters or check back later.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  setFilters({
                    status: '',
                    room_type: '',
                    min_price: '',
                    max_price: '',
                    apartment_id: '',
                  });
                  loadRooms();
                }}
                className="rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <RoomsPageContent />
    </Suspense>
  );
}
