'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { Room } from '@/lib/types/api';
import { 
  Bed, 
  MapPin, 
  Users, 
  Maximize2, 
  Home,
  Wifi,
  Wind,
  Tv,
  Utensils,
  Bath
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  variant?: 'default' | 'compact';
}

export function RoomCard({ room, variant = 'default' }: RoomCardProps) {
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="h-3 w-3" />;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return <Wind className="h-3 w-3" />;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return <Tv className="h-3 w-3" />;
    if (amenityLower.includes('kitchen') || amenityLower.includes('cooking')) return <Utensils className="h-3 w-3" />;
    if (amenityLower.includes('bathroom') || amenityLower.includes('bath')) return <Bath className="h-3 w-3" />;
    return <Home className="h-3 w-3" />;
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

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{room.room_number}</CardTitle>
              <CardDescription className="capitalize text-xs">
                {room.room_type.replace('_', ' ')}
              </CardDescription>
            </div>
            {getStatusBadge(room.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(room.price_per_month || room.actual_price || 0)}
              <span className="text-sm text-muted-foreground font-normal">/month</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {room.apartment && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{room.apartment.name}</span>
                </div>
              )}
              {room.floor_number !== null && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Home className="h-3 w-3" />
                  <span>Floor {room.floor_number}</span>
                </div>
              )}
              {room.size_sqm && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Maximize2 className="h-3 w-3" />
                  <span>{room.size_sqm} sqm</span>
                </div>
              )}
              {room.total_beds > 1 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{room.available_beds}/{room.total_beds} beds</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/rooms/${room.id}`}>Details</Link>
          </Button>
          {room.status === 'available' && (
            <Button size="sm" asChild className="flex-1">
              <Link href={`/rooms/${room.id}/book`}>Book</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all hover:scale-[1.02] duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg overflow-hidden relative">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <Bed className="h-20 w-20 text-primary/20" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            {getStatusBadge(room.status)}
          </div>
          {(['3_beds', '4_beds', 'shared_dorm'].includes(room.room_type) || room.total_beds > 1) && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              {room.available_beds}/{room.total_beds} beds available
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <CardTitle className="text-xl">{room.room_number}</CardTitle>
            <CardDescription className="capitalize mt-1">
              {room.room_type.replace('_', ' ')}
            </CardDescription>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(room.price_per_month || room.actual_price || 0)}
            <span className="text-sm text-muted-foreground font-normal ml-1">/month</span>
          </div>
        </div>

        {room.apartment && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{room.apartment.name}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {room.floor_number !== null && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-muted-foreground">Floor</span>
              <span className="font-medium">{room.floor_number}</span>
            </div>
          )}
          {room.size_sqm && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">{room.size_sqm} sqm</span>
            </div>
          )}
          {room.allowed_gender && room.allowed_gender !== 'any' && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md col-span-2">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium capitalize">{room.allowed_gender}</span>
            </div>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Amenities</div>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((amenity: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-normal flex items-center gap-1"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </Badge>
              ))}
              {amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{amenities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/rooms/${room.id}`}>View Details</Link>
        </Button>
        {room.status === 'available' && (
          <Button asChild className="flex-1">
            <Link href={`/rooms/${room.id}/book`}>Book Now</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
