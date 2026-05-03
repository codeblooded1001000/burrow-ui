/** Up to two letters for avatar-style fallbacks (e.g. "Priya Sharma" → "PS"). */
export function getNameInitials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (!a || !b) return '?';
    return (a + b).toUpperCase();
  }
  const w = parts[0] ?? t;
  if (w.length <= 1) return w.toUpperCase();
  return w.slice(0, 2).toUpperCase();
}

/** Two letters from email local-part when there is no display name (e.g. `ananya.collector@…` → "AC"). */
export function getAccountInitials(fullName: string | null | undefined, email: string): string {
  const n = fullName?.trim();
  if (n) return getNameInitials(n);
  const local = email.split('@')[0] ?? '';
  const segs = local.split(/[._+-]+/).filter(Boolean);
  if (segs.length >= 2) {
    const a = segs[0]?.[0];
    const b = segs[segs.length - 1]?.[0];
    if (a && b) return (a + b).toUpperCase();
  }
  const t = local.slice(0, 2).toUpperCase();
  return t.length > 0 ? t : '?';
}
