'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCommuteForListing } from '@/lib/api/maps-client';
export function commuteQueryKey(listingId: string) {
  return ['maps', 'commute', listingId] as const;
}

export function useCommuteQuery(listingId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: listingId ? commuteQueryKey(listingId) : ['maps', 'commute', 'none'],
    queryFn: () => fetchCommuteForListing(listingId!),
    enabled: Boolean(listingId) && enabled,
    staleTime: 5 * 60_000,
  });
}
