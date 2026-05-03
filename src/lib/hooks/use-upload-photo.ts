'use client';

import { useCallback, useState } from 'react';
import { uploadListingPhoto } from '@/lib/uploads/upload-photo';

export function useUploadPhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadListingPhoto(file);
      return url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setError(msg);
      throw e;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, error, clearError: () => setError(null) };
}
