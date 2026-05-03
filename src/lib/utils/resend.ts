/** Seconds until `iso` instant (UTC). */
export function secondsUntilIso(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.max(0, Math.ceil((target - Date.now()) / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
