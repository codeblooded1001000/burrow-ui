'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/client';
import type { ProfileOwnDto } from '@/lib/api/listing-types';
import { profileMeQueryKey } from '@/lib/api/query-keys';

export function useGetMyProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileMeQueryKey,
    queryFn: () => apiClient.get<ProfileOwnDto>('/profiles/me'),
    enabled,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return failureCount < 2;
    },
  });
}

