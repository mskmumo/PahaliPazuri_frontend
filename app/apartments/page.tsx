'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';
import { apartmentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { Building2, MapPin, Home } from 'lucide-react';

export default function ApartmentsPage() {
  const { data, loading, error, execute } = useApi(apartmentsApi.getAll);

  const loadApartments = useCallback(() => {
    execute({ page: 1, per_page: 12 });
  }, [execute]);

  useEffect(() => {
    loadApartments();
  }, [loadApartments]);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Apartments</h1>
        <p className="text-muted-foreground">
          Discover quality apartment buildings across Nairobi
        </p>
      </div>

      {loading && <LoadingSpinner size="lg" />}

      {error && (
        <ErrorMessage message={error.message || 'Failed to load apartments'} />
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.data.map((apartment) => {
              // Ensure amenities is always an array
              const amenities = Array.isArray(apartment.amenities) 
                ? apartment.amenities 
                : [];
              
              return (
              <Card key={apartment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
                    {apartment.images && apartment.images.length > 0 && apartment.images[0] ? (
                      <Image
                        src={apartment.images[0]}
                        alt={apartment.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <Building2 className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{apartment.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{apartment.location || 'Nairobi'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {apartment.description || 'Quality apartment building with modern amenities'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {apartment.available_rooms} / {apartment.total_rooms} available
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        apartment.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {apartment.is_active ? 'Active' : 'Inactive'}
                    </span>
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
                          +{amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/apartments/${apartment.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
            })}
          </div>

          {data.data.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No apartments found</h3>
              <p className="text-muted-foreground">
                Check back later for new properties
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
