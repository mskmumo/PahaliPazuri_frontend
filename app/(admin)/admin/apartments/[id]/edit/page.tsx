'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Apartment } from '@/lib/types/api';
import { uploadImages, validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/utils/upload-helpers';

interface ImageFile {
  file: File;
  preview: string;
}

export default function EditApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = params.id as string;

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    security_deposit_percentage: '',
    cleaning_fee_monthly: '',
    electricity_included: false,
    electricity_token_contribution: '',
  });

  // Image management
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/apartments/${apartmentId}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch apartment');
        }

        const data = await response.json();
        const apt = data.data;
        
        setApartment(apt);
        setFormData({
          name: apt.name || '',
          code: apt.code || '',
          address: apt.address || '',
          location: apt.location || '',
          description: apt.description || '',
          total_floors: apt.total_floors || 1,
          is_active: apt.is_active ?? true,
          registration_fee: apt.registration_fee || '',
          security_deposit_percentage: apt.security_deposit_percentage || '',
          cleaning_fee_monthly: apt.cleaning_fee_monthly || '',
          electricity_included: apt.electricity_included || false,
          electricity_token_contribution: apt.electricity_token_contribution || '',
        });
        setImages(Array.isArray(apt.images) ? apt.images : []);
        setAmenities(Array.isArray(apt.amenities) ? apt.amenities : []);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load apartment');
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [apartmentId]);

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
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');

      // Upload new images first
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

      // Combine existing images with newly uploaded ones
      const allImages = [...images, ...uploadedUrls];

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
        `${process.env.NEXT_PUBLIC_API_URL}/admin/apartments/${apartmentId}`,
        {
          method: 'PUT',
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
        throw new Error(errorData.message || 'Failed to update apartment');
      }

      setSuccessMessage('Apartment updated successfully!');
      setTimeout(() => {
        router.push('/admin/apartments');
      }, 2000);
    } catch (err) {
      console.error('Error updating apartment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update apartment');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading apartment...</p>
        </div>
      </div>
    );
  }

  if (error && !apartment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/apartments">
            <Button>Back to Apartments</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Apartment</h1>
          <p className="text-gray-600 mt-1">Update apartment details and images</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
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

        {/* Pricing Information */}
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
              <Label htmlFor="electricity_included" className="cursor-pointer">Electricity Included in Rent</Label>
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

            {/* New File Previews */}
            {imageFiles.length > 0 && (
              <div>
                <Label>New Images ({imageFiles.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {imageFiles.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={img.preview}
                          alt={`New image ${index + 1}`}
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
                      <Badge className="absolute bottom-2 left-2 bg-green-500">New</Badge>
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
                  placeholder="https://example.com/image.jpg"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">Use Unsplash URLs or direct image links</p>
            </div>

            {/* Existing Images */}
            {images.length > 0 && (
              <div>
                <Label>Current Images ({images.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Apartment image ${index + 1}`}
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
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-blue-500">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
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
            {uploadingImages ? 'Uploading Images...' : saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
