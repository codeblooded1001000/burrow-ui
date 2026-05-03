import { apiClient } from '@/lib/api/client';
import type { CommuteResponse, ValidatePlaceResponse } from '@/lib/api/maps-types';

export function validateOfficePlace(placeId: string) {
  return apiClient.post<ValidatePlaceResponse>('/maps/validate-place', { placeId });
}

export function fetchCommuteForListing(listingId: string) {
  const q = new URLSearchParams({ listingId });
  return apiClient.get<CommuteResponse>(`/maps/commute?${q.toString()}`);
}
