'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { uploadImages, validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/utils/upload-helpers';

interface ImageFile {
  file: File;
  preview: string;
}

export default function NewApartmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    location: '',
    description: '',
    total_floors: 1,
    is_active: true,
    registration_fee: '',
    security_deposit_percentage: '100',
    cleaning_fee_monthly: '',
    electricity_included: false,
    electricity_token_contribution: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach(img => revokeImagePreview(img.preview));
    };
  }, [imageFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
          'apartments',
          token
        );
        setUploadingImages(false);
      }

      // Combine uploaded URLs with manually entered URLs
      const allImages = [...uploadedUrls, ...images];

      const payload = {
        ...formData,
        images: allImages,
        amenities,
        total_floors: Number(formData.total_floors),
        registration_fee: formData.registration_fee ? Number(formData.registration_fee) : null,
        security_deposit_percentage: formData.security_deposit_percentage ? Number(formData.security_deposit_percentage) : null,
        cleaning_fee_monthly: formData.cleaning_fee_monthly ? Number(formData.cleaning_fee_monthly) : null,
        electricity_token_contribution: formData.electricity_token_contribution ? Number(formData.electricity_token_contribution) : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/apartments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create apartment');
      }

      router.push('/admin/apartments');
    } catch (err) {
      console.error('Error creating apartment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create apartment');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/apartments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Apartment</h1>
          <p className="text-gray-600 mt-1">Create a new apartment building</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Apartment Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SA, WH"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Kilimani, Westlands"
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_floors">Total Floors *</Label>
                <Input
                  id="total_floors"
                  name="total_floors"
                  type="number"
                  min="1"
                  value={formData.total_floors}
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
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_fee">Registration Fee (KES)</Label>
                <Input
                  id="registration_fee"
                  name="registration_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registration_fee}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="security_deposit_percentage">Security Deposit (%)</Label>
                <Input
                  id="security_deposit_percentage"
                  name="security_deposit_percentage"
                  type="number"
                  min="0"
                  max="200"
                  value={formData.security_deposit_percentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cleaning_fee_monthly">Monthly Cleaning Fee (KES)</Label>
                <Input
                  id="cleaning_fee_monthly"
                  name="cleaning_fee_monthly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaning_fee_monthly}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="electricity_token_contribution">Electricity Token (KES)</Label>
                <Input
                  id="electricity_token_contribution"
                  name="electricity_token_contribution"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.electricity_token_contribution}
                  onChange={handleInputChange}
                  disabled={formData.electricity_included}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="electricity_included"
                name="electricity_included"
                checked={formData.electricity_included}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <Label htmlFor="electricity_included" className="cursor-pointer">Electricity Included</Label>
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

            {/* File Previews */}
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
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-blue-500">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input */}
            <div className="space-y-2">
              <Label>Or Add Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
            <div className="space-y-2">
              <Label>Add Amenity</Label>
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="e.g., WiFi, Security, Parking"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/apartments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving || uploadingImages}>
            {uploadingImages ? 'Uploading Images...' : saving ? 'Creating...' : 'Create Apartment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
