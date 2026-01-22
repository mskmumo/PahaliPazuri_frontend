'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apartmentsApi, roomsApi } from '@/lib/api';
import { Apartment, Room } from '@/lib/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { ArrowLeft, Users, Bed, DoorOpen, Calendar } from 'lucide-react';

export default function ApartmentRoomsPage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = params.id as string;

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [apartmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [apartmentRes, roomsRes] = await Promise.all([
        apartmentsApi.getById(parseInt(apartmentId)),
        roomsApi.getAll({ apartment_id: parseInt(apartmentId) }),
      ]);

      setApartment(apartmentRes.data);
      setRooms(roomsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-purple-100 text-purple-800';
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
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Apartment not found" />
      </div>
    );
  }

  const availableRooms = rooms.filter(room => room.status === 'available');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href={`/apartments/${apartmentId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apartment
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{apartment.name} - Available Rooms</h1>
          <p className="text-muted-foreground">{apartment.address}</p>
          <div className="mt-4">
            <Badge variant="secondary" className="mr-2">
              {availableRooms.length} Available Rooms
            </Badge>
            <Badge variant="outline">
              {rooms.length} Total Rooms
            </Badge>
          </div>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rooms available</h3>
              <p className="text-muted-foreground mb-4">
                Check back later for available rooms in this apartment.
              </p>
              <Link href="/apartments">
                <Button>Browse Other Apartments</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className={room.status === 'available' ? 'border-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{room.room_number}</CardTitle>
                      <CardDescription>Floor {room.floor_number || room.floor}</CardDescription>
                    </div>
                    <Badge className={getAvailabilityColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{room.room_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {(['3_beds', '4_beds', 'shared_dorm'].includes(room.room_type) || room.total_beds > 1)
                          ? `${room.available_beds || 0}/${room.total_beds || 0} beds available`
                          : `Max ${room.max_occupancy} occupants`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getGenderBadge(room.allowed_gender || 'any')}>
                        {(room.allowed_gender === 'any' || !room.allowed_gender) ? 'Mixed' : room.allowed_gender}
                      </Badge>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        KES {(room.price_per_month || room.base_price || room.actual_price || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {room.status === 'available' ? (
                    <Link href={`/rooms/${room.id}/book`}>
                      <Button className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Now
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      Not Available
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
