/**
 * Image helper utilities for handling apartment and room images
 */

/**
 * Get the first image from an array of images or return a default placeholder
 * @param images - Array of image URLs
 * @param defaultIcon - Optional default icon component name
 * @returns First valid image URL or null
 */
export function getFirstImage(images: string[] | null | undefined): string | null {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  const firstImage = images[0];
  return firstImage && firstImage.trim() !== '' ? firstImage : null;
}

/**
 * Get all valid images from an array
 * @param images - Array of image URLs
 * @returns Filtered array of valid image URLs
 */
export function getValidImages(images: string[] | null | undefined): string[] {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.filter(img => img && img.trim() !== '');
}

/**
 * Check if images array has valid images
 * @param images - Array of image URLs
 * @returns True if there are valid images
 */
export function hasValidImages(images: string[] | null | undefined): boolean {
  return getValidImages(images).length > 0;
}

/**
 * Get image URL with fallback
 * @param images - Array of image URLs
 * @param index - Index of image to get (default 0)
 * @returns Image URL or null
 */
export function getImageAtIndex(
  images: string[] | null | undefined, 
  index: number = 0
): string | null {
  const validImages = getValidImages(images);
  return validImages[index] || null;
}

/**
 * Format image URL for optimization (if using image proxy/CDN)
 * @param url - Image URL
 * @param width - Desired width
 * @returns Formatted URL
 */
export function formatImageUrl(url: string, width?: number): string {
  if (!url) return '';
  
  // If it's an Unsplash URL, we can add width parameter
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return width ? `${url}${separator}w=${width}` : url;
  }
  
  return url;
}
