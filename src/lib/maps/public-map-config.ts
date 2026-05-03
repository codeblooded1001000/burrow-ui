/** Browser key for Maps JavaScript API (must be unrestricted or allow this app’s origin). */
export function getGoogleMapsBrowserKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
}

/**
 * Vector map ID from Google Cloud Console → Google Maps Platform → Map Management → Map IDs.
 * Recommended when using {@link AdvancedMarker}; without it, some projects show a load error.
 */
export function getGoogleMapsMapId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim();
  return id || undefined;
}
