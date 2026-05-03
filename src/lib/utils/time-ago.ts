const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function timeAgoShort(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'recently';
  const diff = Math.max(0, now - t);
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} hr`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} day${Math.floor(diff / DAY) === 1 ? '' : 's'}`;
  return `${Math.floor(diff / (7 * DAY))} wk`;
}
