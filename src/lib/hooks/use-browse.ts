'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { BrowseFlatmatesResponse, BrowseFlatsResponse } from '@/lib/api/listing-types';
import { buildBrowseQueryString } from '@/lib/browse/build-browse-query';
import { useBrowseStore } from '@/stores/browse-store';

export const browseFlatsInfiniteKey = ['browse', 'flats'] as const;
export const browseFlatmatesInfiniteKey = ['browse', 'flatmates'] as const;

function flatsKey(filters: ReturnType<typeof useBrowseStore.getState>['filters']) {
  return [...browseFlatsInfiniteKey, filters] as const;
}

function flatmatesKey(filters: ReturnType<typeof useBrowseStore.getState>['filters']) {
  return [...browseFlatmatesInfiniteKey, filters] as const;
}

export function useBrowseFlatsQuery(enabled: boolean) {
  const filters = useBrowseStore((s) => s.filters);
  return useInfiniteQuery({
    queryKey: flatsKey(filters),
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const qs = buildBrowseQueryString('flats', filters, pageParam);
      return apiClient.get<BrowseFlatsResponse>(`/browse/flats?${qs}`);
    },
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
  });
}

export function useBrowseFlatmatesQuery(enabled: boolean) {
  const filters = useBrowseStore((s) => s.filters);
  return useInfiniteQuery({
    queryKey: flatmatesKey(filters),
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const qs = buildBrowseQueryString('flatmates', filters, pageParam);
      return apiClient.get<BrowseFlatmatesResponse>(`/browse/flatmates?${qs}`);
    },
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
  });
}
