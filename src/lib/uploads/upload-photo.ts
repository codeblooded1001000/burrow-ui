import { toast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api/client';
import type { ListingPhotoUploadUrlResponse } from '@/lib/api/listing-types';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

export function validateListingPhotoFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) return 'Use a JPEG, PNG, or WebP image.';
  if (file.size > MAX_BYTES) return 'Each photo must be under 5 MB.';
  return null;
}

/** Presigned PUT to R2, then confirm; returns object **key** to store in `photos[]`. */
export async function uploadListingPhoto(file: File): Promise<string> {
  const err = validateListingPhotoFile(file);
  if (err) throw new Error(err);

  const contentType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  const { uploadUrl, key } = await apiClient.post<ListingPhotoUploadUrlResponse>('/listings/me/photos/upload-url', {
    contentType,
    sizeBytes: file.size,
  });

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!putRes.ok) {
    toast.info('Could not upload to storage. Check R2 configuration.');
    throw new Error(`PUT failed: ${putRes.status}`);
  }

  await apiClient.post<{ ok: true; key: string }>('/uploads/confirm', {
    key,
    type: 'listing-photo',
  });
  return key;
}
