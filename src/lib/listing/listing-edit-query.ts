import type { Route } from 'next';

/** Preserve `?edit=1` across listing new flow when editing an existing listing. */
export function withListingEdit(path: Route, isEdit: boolean): Route {
  if (!isEdit) return path;
  const s = path as string;
  return (s.includes('?') ? `${s}&edit=1` : `${s}?edit=1`) as Route;
}
