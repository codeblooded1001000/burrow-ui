'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiClient } from '@/lib/api/client';
import type { ListingDto } from '@/lib/api/listing-types';
import { authMeQueryKey, listingMeQueryKey } from '@/lib/api/query-keys';
export type ListingCreateBody = Omit<
  ListingDto,
  'id' | 'userId' | 'isActive' | 'createdAt' | 'updatedAt' | 'lister'
>;

export function useGetMyListingQuery(enabled = true) {
  return useQuery({
    queryKey: listingMeQueryKey,
    queryFn: () => apiClient.get<ListingDto>('/listings/me'),
    enabled,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ListingCreateBody) => apiClient.post<ListingDto>('/listings/me', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listingMeQueryKey });
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
    },
  });
}

export function useUpdateListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ListingCreateBody) => apiClient.put<ListingDto>('/listings/me', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listingMeQueryKey });
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
    },
  });
}

export function useDeactivateListingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete<{ ok: true }>('/listings/me'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listingMeQueryKey });
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
    },
  });
}
