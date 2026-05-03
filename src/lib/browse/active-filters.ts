import type { BrowseFilters } from '@/stores/browse-store';

export type ActiveFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

/** Build removable chips for the browse filter row + empty state hints. */
export function activeFilterChips(filters: BrowseFilters, onChange: (patch: Partial<BrowseFilters>) => void): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  for (const loc of filters.localities) {
    chips.push({
      id: `loc:${loc}`,
      label: loc,
      onRemove: () => onChange({ localities: filters.localities.filter((l) => l !== loc) }),
    });
  }
  if (filters.budgetMin != null || filters.budgetMax != null) {
    const min = filters.budgetMin != null ? filters.budgetMin.toLocaleString('en-IN') : '—';
    const max = filters.budgetMax != null ? filters.budgetMax.toLocaleString('en-IN') : '—';
    chips.push({
      id: 'budget',
      label: `₹${min}–₹${max}`,
      onRemove: () => onChange({ budgetMin: null, budgetMax: null }),
    });
  }
  if (filters.gender) {
    chips.push({
      id: 'gender',
      label: filters.gender === 'ANYONE' ? 'Anyone' : filters.gender === 'WOMAN' ? 'Women' : 'Men',
      onRemove: () => onChange({ gender: null }),
    });
  }
  if (filters.moveInFrom || filters.moveInTo) {
    chips.push({
      id: 'movein',
      label: 'Move-in dates',
      onRemove: () => onChange({ moveInFrom: null, moveInTo: null }),
    });
  }
  for (const b of filters.bhk) {
    chips.push({
      id: `bhk:${b}`,
      label: `${b === 5 ? '5+' : b} BHK`,
      onRemove: () => onChange({ bhk: filters.bhk.filter((x) => x !== b) }),
    });
  }
  if (filters.smokingPref) {
    const sm =
      filters.smokingPref === 'NON_SMOKER' ? 'Non-smoker' : filters.smokingPref === 'SMOKER' ? 'Smoker ok' : 'Flexible';
    chips.push({
      id: 'smoke',
      label: `Smoking: ${sm}`,
      onRemove: () => onChange({ smokingPref: null }),
    });
  }
  if (filters.foodPref) {
    const fd =
      filters.foodPref === 'PURE_VEG' ? 'Pure veg' : filters.foodPref === 'EGGETARIAN' ? 'Eggetarian' : 'Non-veg ok';
    chips.push({
      id: 'food',
      label: `Food: ${fd}`,
      onRemove: () => onChange({ foodPref: null }),
    });
  }
  if (filters.workSchedule) {
    const w =
      filters.workSchedule === 'HOME' ? 'Mostly home' : filters.workSchedule === 'OFFICE' ? 'Mostly office' : 'Flexible';
    chips.push({
      id: 'work',
      label: `Work: ${w}`,
      onRemove: () => onChange({ workSchedule: null }),
    });
  }
  for (const t of filters.lifestyleTags) {
    chips.push({
      id: `tag:${t}`,
      label: t,
      onRemove: () => onChange({ lifestyleTags: filters.lifestyleTags.filter((x) => x !== t) }),
    });
  }
  for (const p of filters.professions) {
    chips.push({
      id: `prof:${p}`,
      label: p,
      onRemove: () => onChange({ professions: filters.professions.filter((x) => x !== p) }),
    });
  }
  return chips;
}

/** Top 3 "most restrictive" filters for empty state (heuristic: first three chips). */
export function restrictiveFilterHints(filters: BrowseFilters, onChange: (patch: Partial<BrowseFilters>) => void): ActiveFilterChip[] {
  return activeFilterChips(filters, onChange).slice(0, 3);
}
