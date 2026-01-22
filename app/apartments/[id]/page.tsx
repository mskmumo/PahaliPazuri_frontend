'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getValidImages, getImageAtIndex } from '@/lib/utils/image-helpers';
import { Apartment } from '@/lib/types/api';
import {
  Building2,
  MapPin,
  Bed,
  ArrowLeft,
  Wifi,
  Car,
  Shield,
  Zap,
  Sparkles,
  Users,
  Layers
} from 'lucide-react';

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = params.id as string;

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/apartments/${apartmentId}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch apartment details');
        }

        const data = await response.json();
        setApartment(data.data);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load apartment');
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [apartmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ErrorMessage message={error || 'Apartment not found'} />
          <Button onClick={() => router.push('/apartments')} className="mt-4">
            Back to Apartments
          </Button>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('park')) return Car;
    if (lowerAmenity.includes('security')) return Shield;
    if (lowerAmenity.includes('water') || lowerAmenity.includes('power')) return Zap;
    return Sparkles;
  };

  const amenitiesList = Array.isArray(apartment.amenities) ? apartment.amenities : [];
  const imagesList = getValidImages(apartment.images);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header with proper padding */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/apartments')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apartments
          </Button>
        </div>
      </div>

      {/* Main Content with centered container and good margins */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="badge-premium">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
            <Badge
              className={`${apartment.is_active
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
                }`}
            >
              {apartment.is_active ? 'Available' : 'Inactive'}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {apartment.name}
          </h1>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{apartment.address}</span>
          </div>
        </div>

        {/* Image Gallery - Simplified */}
        <div className="mb-10 animate-fade-in-up delay-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="aspect-[4/3] md:aspect-[16/10] bg-muted rounded-2xl overflow-hidden relative shadow-lg">
              {getImageAtIndex(imagesList, 0) ? (
                <Image
                  src={getImageAtIndex(imagesList, 0)!}
                  alt={apartment.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-20 w-20 text-muted-foreground/20" />
                </div>
              )}
            </div>

            {/* Secondary Images Grid */}
            {imagesList.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {imagesList.slice(1, 5).map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] bg-muted rounded-xl overflow-hidden relative shadow-md"
                  >
                    <Image
                      src={image}
                      alt={`${apartment.name} - ${idx + 2}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Grid - Two Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-200">
              <Card className="text-center p-6 border-0 shadow-md">
                <Layers className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{apartment.total_floors}</div>
                <div className="text-sm text-muted-foreground">Floors</div>
              </Card>
              <Card className="text-center p-6 border-0 shadow-md">
                <Building2 className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{apartment.total_rooms || 0}</div>
                <div className="text-sm text-muted-foreground">Rooms</div>
              </Card>
              <Card className="text-center p-6 border-0 shadow-md bg-green-50">
                <Bed className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{apartment.available_rooms || 0}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </Card>
            </div>

            {/* About Section */}
            <Card className="border-0 shadow-md animate-fade-in-up delay-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  About This Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {apartment.description || 'Modern apartment building with excellent amenities and 24/7 security. Designed for comfortable living in a prime location.'}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <Card className="border-0 shadow-md animate-fade-in-up delay-400">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenitiesList.map((amenity, idx) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - CTA */}
          <div className="space-y-6 animate-slide-in-right">

            {/* Location Card */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Location</div>
                    <div className="text-sm text-muted-foreground">{apartment.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Now CTA */}
            <Card className="border-0 shadow-lg gradient-success text-white sticky top-24">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Ready to Book?</h3>
                    <p className="text-sm text-white/80">
                      {apartment.available_rooms || 0} rooms available
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-5 text-white/90">
                  Secure your space in this premium apartment today.
                </p>

                <Link href={`/rooms?apartment_id=${apartmentId}&apartment_name=${encodeURIComponent(apartment.name)}`}>
                  <Button
                    variant="secondary"
                    className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Bed className="h-5 w-5 mr-2" />
                    View Available Rooms
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
