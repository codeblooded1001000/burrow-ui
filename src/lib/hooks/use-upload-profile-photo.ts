'use client';

import { useCallback, useState } from 'react';
import { uploadProfilePhoto } from '@/lib/uploads/upload-profile-photo';

export function useUploadProfilePhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      return await uploadProfilePhoto(file);
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
