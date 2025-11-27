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
import { Apartment } from '@/lib/types/api';
import { 
  Building2, 
  MapPin, 
  Bed, 
  ArrowLeft,
  Wifi,
  Car,
  Shield,
  Zap
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
      <div className="container py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="container py-12">
        <ErrorMessage message={error || 'Apartment not found'} />
        <div className="mt-4 text-center">
          <Button onClick={() => router.push('/apartments')}>
            Back to Apartments
          </Button>
        </div>
      </div>
    );
  }

  const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    WiFi: Wifi,
    Parking: Car,
    Security: Shield,
    Water: Zap,
    'Backup Power': Zap,
  };

  // Ensure arrays are properly formatted
  const amenitiesList = Array.isArray(apartment.amenities) ? apartment.amenities : [];
  const imagesList = Array.isArray(apartment.images) ? apartment.images : [];

  return (
    <div className="container py-12">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/apartments')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Apartments
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{apartment.name}</h1>
            <div className="flex items-center text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{apartment.address}</span>
            </div>
            <p className="text-lg text-muted-foreground">{apartment.location}</p>
          </div>
          <Badge
            variant={apartment.is_active ? 'default' : 'secondary'}
            className="text-lg px-4 py-2"
          >
            {apartment.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
          {imagesList.length > 0 && imagesList[0] ? (
            <Image
              src={imagesList[0]}
              alt={apartment.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>
        {imagesList.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {imagesList.slice(1, 5).map((image, idx) => (
              <div
                key={idx}
                className="aspect-video bg-muted rounded-lg overflow-hidden relative"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${apartment.name} - ${idx + 2}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Apartment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {apartment.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {amenitiesList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenitiesList.map((amenity, idx) => {
                    const Icon = amenityIcons[amenity] || Building2;
                    return (
                      <div key={idx} className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No amenities listed</p>
              )}
            </CardContent>
          </Card>

          {/* Available Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse available rooms in this apartment building
              </p>
              <Link href={`/apartments/${apartmentId}/rooms`}>
                <Button className="w-full">
                  <Bed className="h-4 w-4 mr-2" />
                  View Available Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Floors</span>
                <span className="font-semibold">{apartment.total_floors}</span>
              </div>
              {apartment.total_rooms && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Rooms</span>
                  <span className="font-semibold">{apartment.total_rooms}</span>
                </div>
              )}
              {apartment.available_rooms !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-semibold text-green-600">
                    {apartment.available_rooms}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="font-semibold">{apartment.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apartment.registration_fee != null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Registration Fee</span>
                  <span className="font-semibold">
                    KES {apartment.registration_fee.toLocaleString()}
                  </span>
                </div>
              )}
              {apartment.cleaning_fee_monthly != null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cleaning Fee</span>
                  <span className="font-semibold">
                    KES {apartment.cleaning_fee_monthly.toLocaleString()}/mo
                  </span>
                </div>
              )}
              {apartment.security_deposit_percentage != null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Deposit</span>
                  <span className="font-semibold">
                    {apartment.security_deposit_percentage}% of rent
                  </span>
                </div>
              )}
              {!apartment.electricity_included && apartment.electricity_token_contribution != null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Electricity Token</span>
                  <span className="font-semibold">
                    KES {apartment.electricity_token_contribution.toLocaleString()}/mo
                  </span>
                </div>
              )}
              {apartment.registration_fee == null && 
               apartment.cleaning_fee_monthly == null && 
               apartment.security_deposit_percentage == null && (
                <p className="text-sm text-muted-foreground text-center">
                  Contact management for pricing details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Interested?</h3>
              <p className="text-sm mb-4 opacity-90">
                View available rooms and book your stay today
              </p>
              <Link href={`/apartments/${apartmentId}/rooms`}>
                <Button variant="secondary" className="w-full">
                  View Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
