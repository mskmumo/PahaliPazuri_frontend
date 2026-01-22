/**
 * Helper functions for file uploads
 */

export interface UploadedImage {
  url: string;
  file?: File;
}

/**
 * Upload images to the server
 * @param files - Array of files to upload
 * @param endpoint - API endpoint (apartments or rooms)
 * @param token - Auth token
 * @returns Array of uploaded image URLs
 */
export async function uploadImages(
  files: File[],
  endpoint: 'apartments' | 'rooms',
  token: string
): Promise<string[]> {
  const formData = new FormData();
  
  // Laravel expects 'images[]' notation for arrays
  files.forEach((file) => {
    formData.append('images[]', file);
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/images/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Do NOT set Content-Type header - browser will set it automatically with boundary for multipart/form-data
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let errorMessage = 'Failed to upload images';
    try {
      const error = await response.json();
      // Handle Laravel validation errors
      if (error.errors) {
        const validationErrors = Object.values(error.errors).flat();
        errorMessage = validationErrors.join(', ');
      } else {
        errorMessage = error.message || errorMessage;
      }
    } catch (e) {
      // If response is not JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data.urls || [];
}

/**
 * Delete an image from the server
 * @param url - Image URL to delete
 * @param token - Auth token
 */
export async function deleteImage(url: string, token: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/images/delete`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ path: url }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete image');
  }
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File): string | null {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}

/**
 * Create a preview URL for a file
 * @param file - File to create preview for
 * @returns Object URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL
 * @param url - Object URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Compress image file (client-side)
 * @param file - File to compress
 * @param maxWidth - Max width
 * @param quality - Quality (0-1)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
