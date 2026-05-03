'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { Subhead } from '@/components/ui/Subhead';
import { useGetConstantsQuery } from '@/lib/hooks/use-constants';
import { listingLookingSchema, type ListingLookingInput } from '@/lib/schemas/listing.schemas';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import { withListingEdit } from '@/lib/listing/listing-edit-query';

export default function ListingLookingForPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { data: constants } = useGetConstantsQuery();
  const setField = useListingDraftStore((s) => s.setField);
  const advanceStep = useListingDraftStore((s) => s.advanceStep);
  const draft = useListingDraftStore();

  const schema = useMemo(() => listingLookingSchema, []);

  const form = useForm<ListingLookingInput>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      preferredGender: draft.preferredGender ?? 'ANYONE',
      preferredProfessions: draft.preferredProfessions ?? [],
      smokingAllowed: draft.smokingAllowed ?? false,
      foodPref: draft.foodPref ?? null,
      workSchedulePref: draft.workSchedulePref ?? null,
    },
  });

  if (!constants) {
    return (
      <PhoneShell progress={60} back onBack={() => router.push(withListingEdit('/listing/new/about', isEdit))}>
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell progress={60} back onBack={() => router.push(withListingEdit('/listing/new/about', isEdit))}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>Who are you looking for?</Heading>
        <Subhead>Help us match you with the right flatmates.</Subhead>
      </div>
      <form
        className="mt-8 flex flex-col gap-8"
        onSubmit={form.handleSubmit((v) => {
          setField('preferredGender', v.preferredGender);
          setField('preferredProfessions', v.preferredProfessions);
          setField('smokingAllowed', v.smokingAllowed);
          setField('foodPref', v.foodPref ?? null);
          setField('workSchedulePref', v.workSchedulePref ?? null);
          advanceStep('review');
          router.push(withListingEdit('/listing/new/review', isEdit));
        })}
      >
        <Controller
          name="preferredGender"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="Preferred gender"
              options={['Women', 'Men', 'Anyone']}
              value={field.value === 'WOMAN' ? 'Women' : field.value === 'MAN' ? 'Men' : 'Anyone'}
              onChange={(v) => field.onChange(v === 'Women' ? 'WOMAN' : v === 'Men' ? 'MAN' : 'ANYONE')}
            />
          )}
        />
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Profession preferences (optional)</p>
          <Controller
            name="preferredProfessions"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {constants.professions.map((p) => (
                  <Chip
                    key={p}
                    variant="filter"
                    selected={field.value.includes(p)}
                    disabled={!field.value.includes(p) && field.value.length >= 20}
                    onClick={() => {
                      field.onChange(field.value.includes(p) ? field.value.filter((x) => x !== p) : [...field.value, p]);
                    }}
                  >
                    {p}
                  </Chip>
                ))}
              </div>
            )}
          />
        </div>
        <div>
          <p className="mb-2 font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Lifestyle preferences</p>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 dark:border-dark-border">
            <span className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Smoking allowed</span>
            <Controller
              name="smokingAllowed"
              control={form.control}
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${field.value ? 'bg-teal dark:bg-dark-teal' : 'bg-border dark:bg-dark-border'}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-surface shadow transition-transform dark:bg-dark-surface ${field.value ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              )}
            />
          </div>
        </div>
        <Controller
          name="foodPref"
          control={form.control}
          render={({ field }) => {
            const label =
              field.value === 'PURE_VEG'
                ? 'Pure veg'
                : field.value === 'EGGETARIAN'
                  ? 'Eggetarian'
                  : field.value === 'NON_VEG_OK'
                    ? 'Non-veg ok'
                    : 'No preference';
            return (
              <Pill
                label="Food preference"
                options={['Pure veg', 'Eggetarian', 'Non-veg ok', 'No preference']}
                value={label}
                onChange={(v) =>
                  field.onChange(
                    v === 'Pure veg' ? 'PURE_VEG' : v === 'Eggetarian' ? 'EGGETARIAN' : v === 'Non-veg ok' ? 'NON_VEG_OK' : null,
                  )
                }
              />
            );
          }}
        />
        <Controller
          name="workSchedulePref"
          control={form.control}
          render={({ field }) => {
            const label =
              field.value === 'HOME'
                ? 'Mostly home'
                : field.value === 'OFFICE'
                  ? 'Mostly office'
                  : field.value === 'FLEXIBLE'
                    ? 'Flexible'
                    : 'No preference';
            return (
              <Pill
                label="Work schedule"
                options={['Mostly home', 'Mostly office', 'Flexible', 'No preference']}
                value={label}
                onChange={(v) =>
                  field.onChange(
                    v === 'Mostly home' ? 'HOME' : v === 'Mostly office' ? 'OFFICE' : v === 'Flexible' ? 'FLEXIBLE' : null,
                  )
                }
              />
            );
          }}
        />
        <Button type="submit" variant="primary" disabled={!form.formState.isValid}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
