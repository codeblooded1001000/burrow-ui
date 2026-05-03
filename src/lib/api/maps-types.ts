export type ValidatePlaceResponse =
  | { valid: true; lat: number; lng: number; formattedAddress: string; placeId: string; locality?: string }
  | { valid: false; reason: 'OUT_OF_BOUNDS' | 'API_ERROR' };

export type CommuteReason =
  | 'OK'
  | 'ESTIMATE'
  | 'NO_OFFICE_SET'
  | 'NO_LISTING_LOCATION'
  | 'BUDGET_EXCEEDED'
  | 'API_ERROR';

export type CommuteResponse = {
  commute: {
    distanceMeters: number;
    durationSeconds: number;
    durationInTrafficSeconds: number;
    mode: 'driving' | 'straight_line';
  } | null;
  reason: CommuteReason;
  cached: boolean;
};
