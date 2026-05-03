export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  const s = raw.trim();
  if (s.startsWith('+')) {
    const digits = s.slice(1).replace(/\D/g, '');
    if (digits.length <= 2) return `+${digits}`;
    const cc = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 5) return `+${cc} ${rest}`.trim();
    return `+${cc} ${rest.slice(0, 5)} ${rest.slice(5)}`.trim();
  }
  return s;
}

export function toTelHref(raw: string): string {
  const compact = raw.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) return `tel:${encodeURIComponent(compact)}`;
  return `tel:${encodeURIComponent(compact)}`;
}
