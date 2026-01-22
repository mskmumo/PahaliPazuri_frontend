'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { apartmentsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { getFirstImage, getValidImages } from '@/lib/utils/image-helpers';
import {
  Building2,
  MapPin,
  Home,
  Wifi,
  Car,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function ApartmentsPage() {
  const { data, loading, error, execute } = useApi(apartmentsApi.getAll);

  const loadApartments = useCallback(() => {
    execute({ page: 1, per_page: 12 });
  }, [execute]);

  useEffect(() => {
    loadApartments();
  }, [loadApartments]);

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (lowerAmenity.includes('park')) return <Car className="h-4 w-4" />;
    if (lowerAmenity.includes('security')) return <Shield className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <Badge className="mb-4 text-xs font-semibold px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Accommodations
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              Discover Your
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Perfect </span>
              Apartment
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Quality apartment buildings across Nairobi with modern amenities, secure facilities, and convenient locations
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <ErrorMessage message={error.message || 'Failed to load apartments'} />
          </div>
        )}

        {data && (
          <>
            {/* Stats Bar */}
            {data.data.length > 0 && (
              <div className="mb-8 p-4 bg-muted/30 rounded-2xl border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{data.data.length} Apartments Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  All properties verified
                </div>
              </div>
            )}

            {/* Apartments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {data.data.map((apartment) => {
                const amenities = Array.isArray(apartment.amenities) ? apartment.amenities : [];
                const firstImage = getFirstImage(apartment.images);

                return (
                  <Card
                    key={apartment.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={apartment.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={`${apartment.is_active
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-500 hover:bg-gray-600 text-white'
                            } shadow-lg`}
                        >
                          {apartment.is_active ? 'Available' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Availability Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 dark:bg-black/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">
                          {apartment.available_rooms || 0}/{apartment.total_rooms || 0} Available
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Title and Location */}
                      <div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {apartment.name}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{apartment.location || 'Nairobi'}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {apartment.description || 'Quality apartment building with modern amenities and facilities'}
                      </p>

                      {/* Amenities */}
                      {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {amenities.slice(0, 3).map((amenity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                            >
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {amenities.length > 3 && (
                            <div className="flex items-center px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                              +{amenities.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button
                        asChild
                        className="w-full h-11 rounded-xl font-semibold group/btn shadow-md hover:shadow-lg transition-all"
                      >
                        <Link href={`/apartments/${apartment.id}`} className="flex items-center justify-center gap-2">
                          View Details
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {data.data.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No Apartments Available</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're currently updating our listings. Check back soon for amazing properties!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
