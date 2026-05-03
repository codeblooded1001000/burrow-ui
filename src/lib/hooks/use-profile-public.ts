'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ProfilePublicDto } from '@/lib/api/listing-types';

export function profilePublicQueryKey(userId: string) {
  return ['profiles', 'public', userId] as const;
}

export function useProfilePublicQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: profilePublicQueryKey(userId),
    queryFn: () => apiClient.get<ProfilePublicDto>(`/profiles/${userId}`),
    enabled: enabled && userId.length > 0,
  });
}
