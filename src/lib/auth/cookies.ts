/**
 * Session is httpOnly (`burrow_session`) — not readable from JS.
 * Helpers here are for any future first-party, non-httpOnly flags only.
 */

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
