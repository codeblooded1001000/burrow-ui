import type { BrowseFilters } from '@/stores/browse-store';

function appendMulti(params: URLSearchParams, key: string, values: readonly string[] | readonly number[]): void {
  for (const v of values) {
    params.append(key, String(v));
  }
}

function dateStartIso(ymd: string): string {
  return new Date(`${ymd}T00:00:00.000Z`).toISOString();
}

function dateEndIso(ymd: string): string {
  return new Date(`${ymd}T23:59:59.999Z`).toISOString();
}

type BrowseKind = 'flats' | 'flatmates';

/**
 * Builds query string for GET /browse/flats or /browse/flatmates (API_CONTRACT.md).
 */
export function buildBrowseQueryString(
  kind: BrowseKind,
  filters: BrowseFilters,
  cursor: string | undefined,
  limit = 20,
): string {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('sort', 'newest');
  if (cursor) params.set('cursor', cursor);

  if (filters.localities.length) appendMulti(params, 'localities', filters.localities);
  if (filters.budgetMin != null) params.set('budgetMin', String(filters.budgetMin));
  if (filters.budgetMax != null) params.set('budgetMax', String(filters.budgetMax));
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.moveInFrom) params.set('moveInFrom', dateStartIso(filters.moveInFrom));
  if (filters.moveInTo) params.set('moveInTo', dateEndIso(filters.moveInTo));
  if (kind === 'flats' && filters.bhk.length) appendMulti(params, 'bhk', filters.bhk);
  if (filters.smokingPref) params.set('smokingPref', filters.smokingPref);
  if (filters.foodPref) params.set('foodPref', filters.foodPref);
  if (filters.workSchedule) params.set('workSchedule', filters.workSchedule);
  if (filters.lifestyleTags.length) appendMulti(params, 'lifestyleTags', filters.lifestyleTags);
  if (kind === 'flatmates' && filters.professions.length) appendMulti(params, 'professions', filters.professions);

  return params.toString();
}
