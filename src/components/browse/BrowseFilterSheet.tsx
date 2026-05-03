'use client';

import { useEffect, useMemo, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Pill } from '@/components/ui/Pill';
import { RangeSlider } from '@/components/ui/RangeSlider';
import type { ConstantsDto } from '@/lib/api/listing-types';
import { MAX_RENT, MIN_RENT } from '@/lib/constants';
import type { BrowseFilters, BrowseTab } from '@/stores/browse-store';
import { useBrowseStore } from '@/stores/browse-store';

function cloneFilters(f: BrowseFilters): BrowseFilters {
  return {
    ...f,
    localities: [...f.localities],
    bhk: [...f.bhk],
    lifestyleTags: [...f.lifestyleTags],
    professions: [...f.professions],
  };
}

type BrowseFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: BrowseTab;
  constants: ConstantsDto;
};

export function BrowseFilterSheet({ open, onOpenChange, tab, constants }: BrowseFilterSheetProps) {
  const storeFilters = useBrowseStore((s) => s.filters);
  const setFilters = useBrowseStore((s) => s.setFilters);
  const clearFilters = useBrowseStore((s) => s.clearFilters);
  const [draft, setDraft] = useState<BrowseFilters>(() => cloneFilters(storeFilters));

  useEffect(() => {
    if (open) setDraft(cloneFilters(storeFilters));
  }, [open, storeFilters]);

  const budgetMin = draft.budgetMin ?? MIN_RENT;
  const budgetMax = draft.budgetMax ?? MAX_RENT;

  const hasActive = useMemo(() => activeCount(draft) > 0, [draft]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      headerRight={
        <Button
          type="button"
          variant="tertiary"
          className="!w-auto shrink-0 px-2"
          onClick={() => {
            clearFilters();
            setDraft(cloneFilters(useBrowseStore.getState().filters));
          }}
        >
          Reset
        </Button>
      }
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              const bmin = draft.budgetMin ?? MIN_RENT;
              const bmax = draft.budgetMax ?? MAX_RENT;
              const fullRange = bmin === MIN_RENT && bmax === MAX_RENT;
              setFilters({
                ...draft,
                budgetMin: fullRange ? null : bmin,
                budgetMax: fullRange ? null : bmax,
              });
              onOpenChange(false);
            }}
          >
            Apply filters
          </Button>
          {hasActive ? (
            <Button
              type="button"
              variant="tertiary"
              className="self-center"
              onClick={() => {
                clearFilters();
                setDraft(cloneFilters(useBrowseStore.getState().filters));
              }}
            >
              Reset all
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-4">
        <section>
          <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Locality</p>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {constants.localities.map((l) => {
              const on = draft.localities.includes(l);
              return (
                <Chip key={l} variant="filter" selected={on} onClick={() => toggleLocality(draft, setDraft, l)}>
                  {l}
                </Chip>
              );
            })}
          </div>
        </section>
        <section>
          <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Budget (₹ / month)</p>
          <RangeSlider
            min={MIN_RENT}
            max={MAX_RENT}
            step={1000}
            value={[budgetMin, budgetMax]}
            onValueChange={(v) => setDraft((d) => ({ ...d, budgetMin: v[0], budgetMax: v[1] }))}
          />
          <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
            ₹{budgetMin.toLocaleString('en-IN')} – ₹{budgetMax.toLocaleString('en-IN')}
          </p>
        </section>
        <section>
          <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Gender preference</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'WOMAN' as const, label: 'Women' },
                { id: 'MAN' as const, label: 'Men' },
                { id: 'ANYONE' as const, label: 'Anyone' },
              ] as const
            ).map((g) => (
              <Chip
                key={g.id}
                variant="filter"
                selected={draft.gender === g.id}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    gender: d.gender === g.id ? null : g.id,
                  }))
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </section>
        <section className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">Move-in from</label>
            <input
              type="date"
              value={draft.moveInFrom ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, moveInFrom: e.target.value || null }))}
              className="h-11 w-full rounded-lg border border-border bg-surface px-2 font-sans text-sm dark:border-dark-border dark:bg-dark-surface"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">Move-in to</label>
            <input
              type="date"
              value={draft.moveInTo ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, moveInTo: e.target.value || null }))}
              className="h-11 w-full rounded-lg border border-border bg-surface px-2 font-sans text-sm dark:border-dark-border dark:bg-dark-surface"
            />
          </div>
        </section>
        {tab === 'flats' ? (
          <section>
            <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">BHK</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((b) => {
                const on = draft.bhk.includes(b);
                const label = b === 5 ? '5+' : String(b);
                return (
                  <Chip key={b} variant="filter" selected={on} onClick={() => toggleBhk(draft, setDraft, b)}>
                    {label}
                  </Chip>
                );
              })}
            </div>
          </section>
        ) : null}
        <section>
          <Pill
            label="Smoking preference"
            options={['No preference', 'Non-smoker', 'Smoker ok', 'Flexible']}
            value={
              draft.smokingPref == null
                ? 'No preference'
                : draft.smokingPref === 'NON_SMOKER'
                  ? 'Non-smoker'
                  : draft.smokingPref === 'SMOKER'
                    ? 'Smoker ok'
                    : 'Flexible'
            }
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                smokingPref: v === 'No preference' ? null : v === 'Non-smoker' ? 'NON_SMOKER' : v === 'Smoker ok' ? 'SMOKER' : 'FLEXIBLE',
              }))
            }
          />
        </section>
        <section>
          <Pill
            label="Food preference"
            options={['No preference', 'Pure veg', 'Eggetarian', 'Non-veg ok']}
            value={
              draft.foodPref == null
                ? 'No preference'
                : draft.foodPref === 'PURE_VEG'
                  ? 'Pure veg'
                  : draft.foodPref === 'EGGETARIAN'
                    ? 'Eggetarian'
                    : 'Non-veg ok'
            }
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                foodPref: v === 'No preference' ? null : v === 'Pure veg' ? 'PURE_VEG' : v === 'Eggetarian' ? 'EGGETARIAN' : 'NON_VEG_OK',
              }))
            }
          />
        </section>
        <section>
          <Pill
            label="Work schedule"
            options={['No preference', 'Mostly home', 'Mostly office', 'Flexible']}
            value={
              draft.workSchedule == null
                ? 'No preference'
                : draft.workSchedule === 'HOME'
                  ? 'Mostly home'
                  : draft.workSchedule === 'OFFICE'
                    ? 'Mostly office'
                    : 'Flexible'
            }
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                workSchedule: v === 'No preference' ? null : v === 'Mostly home' ? 'HOME' : v === 'Mostly office' ? 'OFFICE' : 'FLEXIBLE',
              }))
            }
          />
        </section>
        <section>
          <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Lifestyle tags (soft)</p>
          <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
            {[...constants.vibes, ...constants.schedule, ...constants.interests, ...constants.personality].map((t) => {
              const on = draft.lifestyleTags.includes(t);
              return (
                <Chip key={t} variant="tag" selected={on} onClick={() => toggleTag(draft, setDraft, t)}>
                  {t}
                </Chip>
              );
            })}
          </div>
        </section>
        {tab === 'flatmates' ? (
          <section>
            <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Professions</p>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {constants.professions.map((p) => {
                const on = draft.professions.includes(p);
                return (
                  <Chip key={p} variant="filter" selected={on} onClick={() => toggleProfession(draft, setDraft, p)}>
                    {p}
                  </Chip>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function activeCount(f: BrowseFilters): number {
  let n = 0;
  n += f.localities.length;
  if (f.budgetMin != null || f.budgetMax != null) n += 1;
  if (f.gender) n += 1;
  if (f.moveInFrom || f.moveInTo) n += 1;
  n += f.bhk.length;
  if (f.smokingPref) n += 1;
  if (f.foodPref) n += 1;
  if (f.workSchedule) n += 1;
  n += f.lifestyleTags.length;
  n += f.professions.length;
  return n;
}

function toggleLocality(_d: BrowseFilters, set: (fn: (x: BrowseFilters) => BrowseFilters) => void, l: string): void {
  set((cur) => ({
    ...cur,
    localities: cur.localities.includes(l) ? cur.localities.filter((x) => x !== l) : [...cur.localities, l],
  }));
}

function toggleBhk(_d: BrowseFilters, set: (fn: (x: BrowseFilters) => BrowseFilters) => void, b: number): void {
  set((cur) => ({
    ...cur,
    bhk: cur.bhk.includes(b) ? cur.bhk.filter((x) => x !== b) : [...cur.bhk, b].sort((a, c) => a - c),
  }));
}

function toggleTag(_d: BrowseFilters, set: (fn: (x: BrowseFilters) => BrowseFilters) => void, t: string): void {
  set((cur) => ({
    ...cur,
    lifestyleTags: cur.lifestyleTags.includes(t) ? cur.lifestyleTags.filter((x) => x !== t) : [...cur.lifestyleTags, t],
  }));
}

function toggleProfession(_d: BrowseFilters, set: (fn: (x: BrowseFilters) => BrowseFilters) => void, p: string): void {
  set((cur) => ({
    ...cur,
    professions: cur.professions.includes(p) ? cur.professions.filter((x) => x !== p) : [...cur.professions, p],
  }));
}
