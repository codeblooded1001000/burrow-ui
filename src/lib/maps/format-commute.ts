/** Human-readable drive time (uses traffic-aware seconds when provided). */
export function formatDriveDuration(durationInTrafficSeconds: number): string {
  const m = Math.max(1, Math.round(durationInTrafficSeconds / 60));
  if (m >= 120) {
    const h = Math.round(m / 60);
    return `${h} hr`;
  }
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${h} hr ${rest} min` : `${h} hr`;
  }
  return `${m} min`;
}

export function formatRoadDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  const km = distanceMeters / 1000;
  const decimals = km < 10 ? 1 : 0;
  return `${km.toFixed(decimals)} km`;
}
