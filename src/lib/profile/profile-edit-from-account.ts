import type { Route } from 'next';

/** Preserve `?from=account` across profile edit steps when opened from Account. */
export function withFromAccount(path: Route, fromAccount: boolean): Route {
  if (!fromAccount) return path;
  const s = path as string;
  return (s.includes('?') ? `${s}&from=account` : `${s}?from=account`) as Route;
}

export function profileEditBackToAccount(fromAccount: boolean): '/account' | null {
  return fromAccount ? '/account' : null;
}
