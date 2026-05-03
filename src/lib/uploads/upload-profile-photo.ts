import { toast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api/client';
import type { ListingPhotoUploadUrlResponse } from '@/lib/api/listing-types';
import { validateListingPhotoFile } from '@/lib/uploads/upload-photo';

/** Presigned PUT to R2, then confirm; returns object **key** for `photoUrl` on profile PUT/PATCH. */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const err = validateListingPhotoFile(file);
  if (err) throw new Error(err);

  const contentType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  const { uploadUrl, key } = await apiClient.post<ListingPhotoUploadUrlResponse>('/profiles/me/photo/upload-url', {
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
    type: 'profile-photo',
  });
  return key;
}
