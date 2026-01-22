'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Bed, Users, DoorOpen, MapPin } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Room } from '@/lib/types/api';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = parseInt(params.id as string);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.rooms.getById(roomId);

      if (response.success && response.data) {
        const roomData = response.data;
        
        // Parse amenities if it's a string
        if (typeof roomData.amenities === 'string') {
          try {
            roomData.amenities = JSON.parse(roomData.amenities);
          } catch {
            roomData.amenities = [];
          }
        }
        
        // Parse images if it's a string
        if (typeof roomData.images === 'string') {
          try {
            roomData.images = JSON.parse(roomData.images);
          } catch {
            roomData.images = [];
          }
        }
        
        // Ensure amenities and images are arrays
        if (!Array.isArray(roomData.amenities)) {
          roomData.amenities = [];
        }
        if (!Array.isArray(roomData.images)) {
          roomData.images = [];
        }
        
        setRoom(roomData);
      } else {
        setError('Failed to load room data');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Failed to load room');
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.rooms.delete(roomId);
      alert('Room deleted successfully!');
      router.push('/admin/rooms');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800 hover:bg-green-100',
      occupied: 'bg-red-100 text-red-800 hover:bg-red-100',
      maintenance: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      reserved: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (loading) return <LoadingSpinner />;

  if (error || !room) {
    return <ErrorMessage message={error || 'Room not found'} onRetry={fetchRoom} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Link
        href="/admin/rooms"
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to rooms
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room {room.room_number}</h1>
          <p className="text-muted-foreground mt-2">
            {room.apartment?.name || 'Unknown Apartment'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/rooms/${roomId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Room
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Room Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Room Number</span>
              <span className="font-semibold">{room.room_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Room Type</span>
              <Badge variant="outline" className="capitalize">
                {room.room_type?.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Floor</span>
              <span className="font-semibold">Floor {room.floor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getStatusBadge(room.status)}>
                {room.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity & Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Total Beds
              </span>
              <span className="font-semibold">{room.total_beds}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Occupied Beds
              </span>
              <span className="font-semibold">{room.total_beds - room.available_beds}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Available Beds
              </span>
              <span className="font-semibold text-green-600">
                {room.available_beds}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gender Allocation</span>
              <Badge variant="outline" className="capitalize">
                {room.gender_type || 'mixed'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent (per bed)</p>
              <p className="text-2xl font-bold text-green-600">
                KES {room.price_per_bed_month?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Per Night</p>
              <p className="text-xl font-semibold">
                KES {room.price_per_night?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Price (Monthly)</p>
              <p className="text-xl font-semibold">
                KES {room.price_per_month?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {room.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{room.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {room.images && room.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {room.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={image}
                    alt={`Room ${room.room_number} - Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apartment Information */}
      {room.apartment && (
        <Card>
          <CardHeader>
            <CardTitle>Apartment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Apartment Name</span>
              <span className="font-semibold">{room.apartment.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </span>
              <span className="font-semibold">{room.apartment.location}</span>
            </div>
            <div className="pt-2">
              <Link href={`/admin/apartments/${room.apartment.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Apartment Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
