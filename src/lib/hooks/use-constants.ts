'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConstantsDto } from '@/lib/api/listing-types';
import { constantsQueryKey } from '@/lib/api/query-keys';

const ONE_HOUR_MS = 3_600_000;

export function useGetConstantsQuery() {
  return useQuery({
    queryKey: constantsQueryKey,
    queryFn: () => apiClient.get<ConstantsDto>('/constants'),
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS * 2,
  });
}
