'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { roomsApi, pricingApi } from '@/lib/api';
import { Room } from '@/lib/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { estimateMoveInCost } from '@/lib/utils/pricing-utils';
import PricingCalculator from '@/components/pricing/PricingCalculator';
import {
  ArrowLeft,
  Bed,
  Users,
  Building,
  MapPin,
  Wifi,
  Check,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface PricingSummary {
  price_per_bed_per_month: number;
  monthly_rent: number;
  security_deposit: number;
  registration_fee: number;
  cleaning_fee_monthly: number;
  estimated_move_in_cost: number;
}

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [pricingSummary, setPricingSummary] = useState<PricingSummary | null>(null);

  useEffect(() => {
    loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.getById(Number(params.id));
      setRoom(response.data);

      // Load pricing summary for consistent move-in cost
      try {
        const pricingResponse = await pricingApi.getRoomPricingSummary(Number(params.id));
        if (pricingResponse.success && pricingResponse.data) {
          setPricingSummary(pricingResponse.data);
        }
      } catch {
        console.log('Pricing summary not available, using estimates');
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ErrorMessage message={error || 'Room not found'} />
        <div className="text-center mt-6">
          <Button onClick={() => router.push('/rooms')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  const images = room.images && Array.isArray(room.images) ? room.images : [];
  const hasImages = images.length > 0;

  const amenities = (() => {
    if (!room.amenities) return [];
    if (Array.isArray(room.amenities)) return room.amenities;
    if (typeof room.amenities === 'string') {
      try {
        return JSON.parse(room.amenities);
      } catch {
        return [];
      }
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Button
              onClick={() => router.push('/rooms')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge
              className={`text-xs ${room.status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              {room.status}
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-5">

            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {hasImages ? (
                  <Image
                    src={images[activeImage]}
                    alt={`Room ${room.room_number}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Bed className="h-16 w-16 text-gray-300" />
                  </div>
                )}

                {/* Room Number */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                    Room {room.room_number}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="p-3 border-t flex gap-2 overflow-x-auto">
                  {images.map((img, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${activeImage === idx ? 'border-blue-500' : 'border-transparent'
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Info */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border">
                <Building className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Floor</p>
                <p className="font-semibold">{room.floor_number || '-'}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <Users className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Capacity</p>
                <p className="font-semibold">{room.max_occupancy || 1}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <Bed className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold text-sm capitalize">{room.room_type.replace('_', ' ')}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <Bed className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Beds</p>
                <p className="font-semibold">{room.available_beds}/{room.total_beds}</p>
              </div>
            </div>

            {/* Location */}
            {room.apartment && (
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{room.apartment.name}</p>
                    <p className="text-sm text-gray-500">{room.apartment.location}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      <Wifi className="h-3.5 w-3.5" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-20 overflow-hidden">
              {/* Price Header */}
              <div className="bg-gray-900 text-white p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly Rent</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(room.price_per_bed_month || room.price_per_month || 0)}
                </p>
                {['3_beds', '4_beds', 'shared_dorm'].includes(room.room_type) && (
                  <p className="text-xs text-gray-400 mt-1">per bed</p>
                )}
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Key Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Room Code</span>
                    <span className="font-medium">{room.room_code}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Bed Type</span>
                    <span className="font-medium capitalize">{room.bed_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${room.status === 'available' ? 'text-green-600' : 'text-gray-500'}`}>
                      {room.status}
                    </span>
                  </div>
                </div>

                {/* Move-in Cost Estimate */}
                {pricingSummary && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">Estimated Move-in Cost</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(pricingSummary.estimated_move_in_cost)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Includes rent, deposit & fees
                    </p>
                  </div>
                )}

                {/* Book Button */}
                {room.status === 'available' ? (
                  <Button
                    size="lg"
                    className="w-full font-semibold"
                    asChild
                  >
                    <Link href={`/rooms/${room.id}/book`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book This Room
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Not Available
                  </Button>
                )}

                {/* Trust Points */}
                <div className="pt-4 border-t space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span>Free cancellation within 24hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span>Instant confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Calculator */}
        <div className="mt-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Calculate Your Total Cost</h2>
            <p className="text-sm text-gray-500">Select duration to see full breakdown</p>
          </div>
          <PricingCalculator roomId={room.id} defaultBeds={1} />
        </div>
      </main>
    </div>
  );
}
