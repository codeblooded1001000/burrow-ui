'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ListingDto } from '@/lib/api/listing-types';

export function listingDetailQueryKey(listingId: string) {
  return ['listings', 'detail', listingId] as const;
}

export function useListingDetailQuery(listingId: string, enabled = true) {
  return useQuery({
    queryKey: listingDetailQueryKey(listingId),
    queryFn: () => apiClient.get<ListingDto>(`/listings/${listingId}`),
    enabled: enabled && listingId.length > 0,
  });
}
