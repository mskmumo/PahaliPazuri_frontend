'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Room } from '@/lib/types/api';
import { pricingApi } from '@/lib/api/pricing';

export default function RoomEditPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = parseInt(params.id as string);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    apartment_id: '',
    room_number: '',
    room_type: '',
    floor_number: '',
    floor_code: '',
    bed_type: '',
    total_beds: '',
    available_beds: '',
    gender_type: 'mixed',
    sharing_type: 'single',
    description: '',
    price_per_night: '',
    price_per_month: '',
    price_per_bed_night: '',
    price_per_bed_month: '',
    base_price_per_bed_month: '',
    size_sqm: '',
    max_occupancy: '',
    amenities: [] as string[],
    images: [] as string[],
    status: '',
    is_furnished: true,
    furnishing_details: '',
  });

  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.rooms.getById(roomId);

      if (response.success && response.data) {
        const roomData = response.data;
        setRoom(roomData);
        setFormData({
          apartment_id: roomData.apartment_id?.toString() || '',
          room_number: roomData.room_number || '',
          room_type: roomData.room_type || '',
          floor_number: roomData.floor_number?.toString() || '',
          floor_code: roomData.floor_code || '',
          bed_type: roomData.bed_type || '',
          total_beds: roomData.total_beds?.toString() || '',
          available_beds: roomData.available_beds?.toString() || '',
          gender_type: roomData.gender_type || 'mixed',
          sharing_type: roomData.sharing_type || 'single',
          description: roomData.description || '',
          price_per_night: roomData.price_per_night?.toString() || '',
          price_per_month: roomData.price_per_month?.toString() || '',
          price_per_bed_night: roomData.price_per_bed_night?.toString() || '',
          price_per_bed_month: roomData.price_per_bed_month?.toString() || '',
          base_price_per_bed_month: roomData.base_price_per_bed_month?.toString() || '',
          size_sqm: roomData.size_sqm?.toString() || '',
          max_occupancy: roomData.max_occupancy?.toString() || '',
          amenities: roomData.amenities || [],
          images: roomData.images || [],
          status: roomData.status || 'available',
          is_furnished: roomData.is_furnished ?? true,
          furnishing_details: roomData.furnishing_details || '',
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate price when relevant fields change
    if (['total_beds', 'gender_type'].includes(name)) {
      setTimeout(() => calculateSuggestedPrice(), 300);
    }
  };

  // Map total_beds to sharing_type
  const getSharingType = (beds: number): string => {
    switch(beds) {
      case 1: return 'single';
      case 2: return '2_sharing';
      case 3: return '3_sharing';
      case 4: return '4_sharing';
      default: return beds > 4 ? '4_sharing' : 'single';
    }
  };

  const calculateSuggestedPrice = async () => {
    try {
      setCalculatingPrice(true);
      const beds = parseInt(formData.total_beds.toString()) || 1;
      const sharingType = getSharingType(beds);
      
      // Parse amenities from room data if available
      let amenities: string[] = [];
      if (room?.amenities) {
        amenities = Array.isArray(room.amenities) ? room.amenities : [];
      }
      
      const response = await pricingApi.suggestRoomPrice({
        sharing_type: sharingType,
        gender_type: formData.gender_type,
        amenities: amenities,
      });

      if (response.success && response.data) {
        const price = response.data.suggested_price_per_bed_per_month;
        setSuggestedPrice(price);
        
        // Auto-fill the pricing field
        setFormData(prev => ({
          ...prev,
          monthly_rent: price.toString(),
          sharing_type: sharingType,
        }));
      }
    } catch (err) {
      console.error('Failed to calculate price:', err);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData: any = {
        apartment_id: parseInt(formData.apartment_id),
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor_number: parseInt(formData.floor_number),
        floor_code: formData.floor_code,
        bed_type: formData.bed_type,
        total_beds: parseInt(formData.total_beds),
        gender_type: formData.gender_type,
        sharing_type: formData.sharing_type,
        status: formData.status,
        price_per_night: parseFloat(formData.price_per_night),
        price_per_bed_night: parseFloat(formData.price_per_bed_night),
      };

      // Optional fields
      if (formData.available_beds) updateData.available_beds = parseInt(formData.available_beds);
      if (formData.description) updateData.description = formData.description;
      if (formData.price_per_month) updateData.price_per_month = parseFloat(formData.price_per_month);
      if (formData.price_per_bed_month) updateData.price_per_bed_month = parseFloat(formData.price_per_bed_month);
      if (formData.base_price_per_bed_month) updateData.base_price_per_bed_month = parseFloat(formData.base_price_per_bed_month);
      if (formData.size_sqm) updateData.size_sqm = parseFloat(formData.size_sqm);
      if (formData.max_occupancy) updateData.max_occupancy = parseInt(formData.max_occupancy);
      if (formData.amenities.length > 0) updateData.amenities = formData.amenities;
      if (formData.images.length > 0) updateData.images = formData.images;
      if (formData.furnishing_details) updateData.furnishing_details = formData.furnishing_details;
      updateData.is_furnished = formData.is_furnished;

      const response = await adminApi.rooms.update(roomId, updateData);

      if (response.success) {
        alert('Room updated successfully!');
        router.push(`/admin/rooms/${roomId}`);
      } else {
        setError('Failed to update room');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; errors?: any } }; message?: string };

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to update room');
      }
      console.error('Error updating room:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !room) {
    return <ErrorMessage message={error || 'Room not found'} onRetry={fetchRoom} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/admin/rooms/${roomId}`}
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to room details
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Room</h1>
        <p className="text-muted-foreground mt-2">Update room information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="room_number">
                Room Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="room_number"
                name="room_number"
                type="text"
                value={formData.room_number}
                onChange={handleInputChange}
                required
                placeholder="e.g., 101, A-201"
              />
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="room_type">
                Room Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="room_type"
                name="room_type"
                value={formData.room_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select room type</option>
                <option value="shared_dorm">Shared Dorm (Bed-by-bed booking)</option>
                <option value="private">Private (Entire room for one person/group)</option>
              </select>
            </div>

            {/* Floor Number & Floor Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor_number">
                  Floor Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="floor_number"
                  name="floor_number"
                  type="number"
                  value={formData.floor_number}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="e.g., 1 (0=Ground, 1=First Floor)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor_code">
                  Floor Code
                </Label>
                <Input
                  id="floor_code"
                  name="floor_code"
                  type="text"
                  value={formData.floor_code}
                  onChange={handleInputChange}
                  placeholder="e.g., G, 1F, 2F"
                />
              </div>
            </div>

            {/* Bed Type & Total Beds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bed_type">
                  Bed Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="bed_type"
                  name="bed_type"
                  value={formData.bed_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select bed type</option>
                  <option value="single">Single Bed (1 bed)</option>
                  <option value="twin">Twin Beds (2 single beds)</option>
                  <option value="double_decker_2">Double Decker (2 beds)</option>
                  <option value="double_decker_4">Double Decker (4 beds)</option>
                  <option value="mixed">Mixed Configuration</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_beds">
                  Total Beds <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="total_beds"
                  name="total_beds"
                  type="number"
                  value={formData.total_beds}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="20"
                  placeholder="e.g., 4"
                />
              </div>
            </div>

            {/* Available Beds */}
            <div className="space-y-2">
              <Label htmlFor="available_beds">
                Available Beds
              </Label>
              <Input
                id="available_beds"
                name="available_beds"
                type="number"
                value={formData.available_beds}
                onChange={handleInputChange}
                min="0"
                placeholder="Leave empty to auto-calculate"
              />
              <p className="text-sm text-muted-foreground">
                Current bookings will determine actual availability
              </p>
            </div>

            {/* Gender Type (for pricing calculation) */}
            <div className="space-y-2">
              <Label htmlFor="gender_type">Gender Type</Label>
              <select
                id="gender_type"
                name="gender_type"
                value={formData.gender_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="mixed">Mixed</option>
                <option value="male_only">Male Only</option>
                <option value="female_only">Female Only</option>
              </select>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Pricing</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={calculateSuggestedPrice}
                  disabled={calculatingPrice || !formData.total_beds}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculatingPrice ? 'Calculating...' : 'Calculate Price'}
                </Button>
              </div>

              {suggestedPrice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Suggested Price (Auto-calculated)</p>
                      <p className="text-xs text-green-600 mt-1">
                        Based on {formData.total_beds} bed(s), {formData.gender_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">KES {suggestedPrice.toLocaleString()}</p>
                      <p className="text-xs text-green-600">per bed/month</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Per Bed Per Night */}
              <div className="space-y-2">
                <Label htmlFor="price_per_bed_night">
                  Price Per Bed Per Night (KES) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price_per_bed_night"
                  name="price_per_bed_night"
                  type="number"
                  value={formData.price_per_bed_night}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500"
                />
              </div>

              {/* Price Per Bed Per Month */}
              <div className="space-y-2">
                <Label htmlFor="price_per_bed_month">
                  Price Per Bed Per Month (KES)
                </Label>
                <Input
                  id="price_per_bed_month"
                  name="price_per_bed_month"
                  type="number"
                  value={formData.price_per_bed_month}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 15000"
                  className={suggestedPrice ? 'bg-green-50' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Monthly rent per bed - Auto-calculated based on room configuration
                </p>
              </div>

              {/* Room Level Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_night">
                    Price Per Room Per Night (KES) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price_per_night"
                    name="price_per_night"
                    type="number"
                    value={formData.price_per_night}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_month">
                    Price Per Room Per Month (KES)
                  </Label>
                  <Input
                    id="price_per_month"
                    name="price_per_month"
                    type="number"
                    value={formData.price_per_month}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 60000"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-2">Pricing Factors</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Base price: Determined by occupancy ({formData.total_beds} bed(s))</li>
                  <li>• Gender allocation: {formData.gender_type}</li>
                  <li>• Amenities included in calculation</li>
                </ul>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size_sqm">Room Size (sqm)</Label>
                <Input
                  id="size_sqm"
                  name="size_sqm"
                  type="number"
                  value={formData.size_sqm}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 25.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_occupancy">Max Occupancy</Label>
                <Input
                  id="max_occupancy"
                  name="max_occupancy"
                  type="number"
                  value={formData.max_occupancy}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Maximum number of people"
                />
              </div>
            </div>

            {/* Sharing Type */}
            <div className="space-y-2">
              <Label htmlFor="sharing_type">
                Sharing Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="sharing_type"
                name="sharing_type"
                value={formData.sharing_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="single">Single (1 person per room)</option>
                <option value="2_sharing">2 Sharing</option>
                <option value="3_sharing">3 Sharing</option>
                <option value="4_sharing">4 Sharing</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter room description..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/rooms/${roomId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
