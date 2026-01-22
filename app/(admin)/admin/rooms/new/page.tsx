'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon, Calculator } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Apartment } from '@/lib/types/api';
import { uploadImages, validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/utils/upload-helpers';
import { pricingApi } from '@/lib/api/pricing';

interface ImageFile {
  file: File;
  preview: string;
}

export default function NewRoomPage() {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    apartment_id: '',
    room_number: '',
    floor_number: 1,
    floor_code: '1F',
    room_type: 'shared_dorm',
    bed_type: 'single',
    total_beds: 1,
    description: '',
    price_per_night: '',
    price_per_month: '',
    price_per_bed_night: '',
    price_per_bed_month: '',
    base_price_per_bed_month: '',
    max_occupancy: 1,
    status: 'available',
    is_furnished: true,
    gender_type: 'mixed',
    sharing_type: 'single',
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apartments`);
        const data = await response.json();
        setApartments(data.data || []);
      } catch (err) {
        console.error('Failed to fetch apartments:', err);
      } finally {
        setLoadingApartments(false);
      }
    };
    fetchApartments();
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach(img => revokeImagePreview(img.preview));
    };
  }, [imageFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-calculate price when relevant fields change
    if (['total_beds', 'gender_type', 'sharing_type'].includes(name)) {
      // Debounce the calculation slightly
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
      
      const response = await pricingApi.suggestRoomPrice({
        sharing_type: sharingType,
        gender_type: formData.gender_type,
        amenities: amenities,
      });

      if (response.success && response.data) {
        const price = response.data.suggested_price_per_bed_per_month;
        setSuggestedPrice(price);
        
        // Auto-fill the pricing fields
        setFormData(prev => ({
          ...prev,
          price_per_bed_month: price.toString(),
          base_price_per_bed_month: price.toString(),
          price_per_bed_night: (price / 30).toFixed(2),
          price_per_month: (price * beds).toString(),
          price_per_night: ((price * beds) / 30).toFixed(2),
          sharing_type: sharingType,
        }));
      }
    } catch (err) {
      console.error('Failed to calculate price:', err);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const error = validateImageFile(file);
      if (error) {
        alert(error);
        return;
      }

      const preview = createImagePreview(file);
      setImageFiles(prev => [...prev, { file, preview }]);
    });

    e.target.value = '';
  };

  const removeImageFile = (index: number) => {
    const img = imageFiles[index];
    revokeImagePreview(img.preview);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
      // Recalculate price with new amenity
      setTimeout(() => calculateSuggestedPrice(), 300);
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
    // Recalculate price without this amenity
    setTimeout(() => calculateSuggestedPrice(), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      // Upload images first
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        uploadedUrls = await uploadImages(
          imageFiles.map(img => img.file),
          'rooms',
          token
        );
        setUploadingImages(false);
      }

      // Combine uploaded URLs with manually entered URLs
      const allImages = [...uploadedUrls, ...imageUrls];

      const payload = {
        ...formData,
        apartment_id: Number(formData.apartment_id),
        floor_number: Number(formData.floor_number),
        total_beds: Number(formData.total_beds),
        max_occupancy: Number(formData.max_occupancy),
        price_per_night: Number(formData.price_per_night) || 0,
        price_per_month: Number(formData.price_per_month) || 0,
        price_per_bed_night: Number(formData.price_per_bed_night) || 0,
        price_per_bed_month: Number(formData.price_per_bed_month) || 0,
        base_price_per_bed_month: Number(formData.base_price_per_bed_month) || Number(formData.price_per_bed_month) || 0,
        images: allImages,
        amenities,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle Laravel validation errors
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(errorData.message || 'Failed to create room');
      }

      router.push('/admin/rooms');
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (loadingApartments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/rooms">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Room</h1>
          <p className="text-gray-600 mt-1">Create a new room</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apartment_id">Apartment *</Label>
              <select
                id="apartment_id"
                name="apartment_id"
                value={formData.apartment_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Apartment</option>
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>{apt.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  placeholder="e.g., 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor_number">Floor Number *</Label>
                <Input
                  id="floor_number"
                  name="floor_number"
                  type="number"
                  min="0"
                  value={formData.floor_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor_code">Floor Code *</Label>
                <Input
                  id="floor_code"
                  name="floor_code"
                  value={formData.floor_code}
                  onChange={handleInputChange}
                  placeholder="e.g., 1F, GF"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_type">Room Type *</Label>
                <select
                  id="room_type"
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="shared_dorm">Shared Dorm (Bed-by-bed booking)</option>
                  <option value="private">Private (Entire room for one person/group)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="bed_type">Bed Type *</Label>
                <select
                  id="bed_type"
                  name="bed_type"
                  value={formData.bed_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="single">Single</option>
                  <option value="twin">Twin</option>
                  <option value="bunk">Bunk</option>
                  <option value="double_decker_2">Double Decker (2)</option>
                  <option value="double_decker_4">Double Decker (4)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_beds">Total Beds *</Label>
                <Input
                  id="total_beds"
                  name="total_beds"
                  type="number"
                  min="1"
                  value={formData.total_beds}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_occupancy">Max Occupancy *</Label>
                <Input
                  id="max_occupancy"
                  name="max_occupancy"
                  type="number"
                  min="1"
                  value={formData.max_occupancy}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pricing</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Suggested Price (Auto-calculated)</p>
                    <p className="text-xs text-green-600 mt-1">
                      Based on {formData.total_beds} bed(s), {formData.gender_type}
                      {amenities.length > 0 && ` + ${amenities.length} amenities`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">KES {suggestedPrice.toLocaleString()}</p>
                    <p className="text-xs text-green-600">per bed/month</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_per_bed_month">Price per Bed/Month (KES) *</Label>
                <Input
                  id="price_per_bed_month"
                  name="price_per_bed_month"
                  type="number"
                  min="0"
                  value={formData.price_per_bed_month}
                  onChange={handleInputChange}
                  required
                  className={suggestedPrice ? 'bg-green-50' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated based on room configuration
                </p>
              </div>
              <div>
                <Label htmlFor="price_per_bed_night">Price per Bed/Night (KES)</Label>
                <Input
                  id="price_per_bed_night"
                  name="price_per_bed_night"
                  type="number"
                  min="0"
                  value={formData.price_per_bed_night}
                  onChange={handleInputChange}
                  className={suggestedPrice ? 'bg-green-50' : ''}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Pricing Calculation</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Base price determined by occupancy ({formData.total_beds} bed(s))</li>
                <li>• Gender allocation adjustment ({formData.gender_type})</li>
                <li>• Amenity charges added ({amenities.length} selected)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label>Upload Images</Label>
              <div className="mt-2 flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
                    <Upload className="h-4 w-4" />
                    <span>Choose Files</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500">Max 5MB per image (JPEG, PNG, WebP)</p>
              </div>
            </div>

            {/* Image Previews */}
            {imageFiles.length > 0 && (
              <div>
                <Label>Selected Files ({imageFiles.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {imageFiles.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImageFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input */}
            <div>
              <Label>Or Add Image URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                />
                <Button type="button" onClick={addImageUrl} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`URL ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="e.g., WiFi, Desk, Wardrobe"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Room Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div>
                <Label htmlFor="gender_type">Gender Type</Label>
                <select
                  id="gender_type"
                  name="gender_type"
                  value={formData.gender_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="mixed">Mixed</option>
                  <option value="male_only">Male Only</option>
                  <option value="female_only">Female Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_furnished"
                name="is_furnished"
                checked={formData.is_furnished}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <Label htmlFor="is_furnished" className="cursor-pointer">Furnished</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/rooms">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || uploadingImages}>
            {uploadingImages ? 'Uploading Images...' : loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </div>
  );
}
