/** Default when `NEXT_PUBLIC_R2_PUBLIC_URL` is unset — keep in sync with API `photo-url` helper. */
const DEFAULT_PUBLIC_BASE = 'https://cdn.burrow.in';

/** Full absolute URL (http or https). Keys and relative paths are not treated as URLs. */
function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const p = new URL(url).protocol;
    return p === 'https:' || p === 'http:';
  } catch {
    return false;
  }
}

/** Turn stored ref (HTTPS legacy or R2 object key) into a URL the browser can load. */
export function resolveMediaRefToPublicUrl(ref: string | null | undefined): string | null {
  if (ref === null || ref === undefined) return null;
  const t = ref.trim();
  if (t.length === 0) return null;
  if (isAbsoluteHttpUrl(t)) return t;
  const configured = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ?? '';
  const base = (configured.length > 0 ? configured : DEFAULT_PUBLIC_BASE).replace(/\/$/, '');
  return `${base}/${t.replace(/^\/+/, '')}`;
}
