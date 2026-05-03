'use client';

import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Heading } from '@/components/ui/Heading';
import { Pill } from '@/components/ui/Pill';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { Subhead } from '@/components/ui/Subhead';
import { useGetConstantsQuery } from '@/lib/hooks/use-constants';
import { MAX_LIFESTYLE_TAGS, MAX_RENT, MIN_RENT } from '@/lib/constants';
import { profilePreferencesSchema, type ProfilePreferencesForm } from '@/lib/schemas/profile-flow.schemas';
import { useProfileDraftStore } from '@/stores/profile-draft-store';
import { withFromAccount } from '@/lib/profile/profile-edit-from-account';

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toggleTag(cur: string[], t: string): string[] {
  if (cur.includes(t)) return cur.filter((x) => x !== t);
  if (cur.length >= MAX_LIFESTYLE_TAGS) return cur;
  return [...cur, t];
}

function InputDate({
  label,
  min,
  value,
  onChange,
  onBlur,
  name,
  ref,
}: {
  label: string;
  min: string;
  value: string;
  onChange: ComponentProps<'input'>['onChange'];
  onBlur: ComponentProps<'input'>['onBlur'];
  name: string;
  ref: ComponentProps<'input'>['ref'];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{label}</label>
      <input
        type="date"
        name={name}
        ref={ref}
        min={min}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="h-14 w-full rounded-xl border border-border bg-surface px-4 font-sans text-base text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
      />
    </div>
  );
}

export default function ProfilePreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAccount = searchParams.get('from') === 'account';
  const { data: constants } = useGetConstantsQuery();
  const setField = useProfileDraftStore((s) => s.setField);
  const advanceStep = useProfileDraftStore((s) => s.advanceStep);
  const draft = useProfileDraftStore();

  const lifestylePool = useMemo(() => {
    if (!constants) return [] as string[];
    return [...constants.vibes, ...constants.schedule, ...constants.interests, ...constants.personality];
  }, [constants]);

  const schema = useMemo(() => {
    if (!constants?.localities.length || !lifestylePool.length) return null;
    return profilePreferencesSchema(constants.localities, lifestylePool);
  }, [constants?.localities, lifestylePool]);

  const form = useForm<ProfilePreferencesForm>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: {
      preferredLocalities: draft.preferredLocalities?.length ? draft.preferredLocalities : [],
      budgetMin: draft.budgetMin ?? MIN_RENT,
      budgetMax: draft.budgetMax ?? MAX_RENT,
      moveInDate: draft.moveInDate ? draft.moveInDate.slice(0, 10) : todayYmd(),
      lifestyleTags: draft.lifestyleTags ?? [],
      smokingPref: draft.smokingPref ?? 'FLEXIBLE',
      foodPref: draft.foodPref ?? 'PURE_VEG',
    },
  });

  const tags = form.watch('lifestyleTags');
  const budgetMin = form.watch('budgetMin');
  const budgetMax = form.watch('budgetMax');

  if (!constants || !schema) {
    return (
      <PhoneShell progress={66} back onBack={() => router.push(withFromAccount('/profile/edit/about', fromAccount))}>
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell progress={66} back onBack={() => router.push(withFromAccount('/profile/edit/about', fromAccount))}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>What you are looking for</Heading>
        <Subhead>Localities, budget, move-in timing, and a few tags.</Subhead>
      </div>
      <form
        className="mt-8 flex flex-col gap-8"
        onSubmit={form.handleSubmit((v) => {
          setField('preferredLocalities', v.preferredLocalities);
          setField('budgetMin', v.budgetMin);
          setField('budgetMax', v.budgetMax);
          setField('moveInDate', new Date(`${v.moveInDate}T12:00:00.000Z`).toISOString());
          setField('lifestyleTags', v.lifestyleTags);
          setField('smokingPref', v.smokingPref ?? null);
          setField('foodPref', v.foodPref ?? null);
          advanceStep('review');
          router.push(withFromAccount('/profile/edit/review', fromAccount));
        })}
      >
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Preferred localities</p>
          <Controller
            name="preferredLocalities"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {constants.localities.map((l) => (
                  <Chip
                    key={l}
                    variant="filter"
                    selected={field.value.includes(l)}
                    onClick={() => field.onChange(field.value.includes(l) ? field.value.filter((x) => x !== l) : [...field.value, l])}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            )}
          />
        </div>
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Budget (₹ / month)</p>
          <RangeSlider
            min={MIN_RENT}
            max={MAX_RENT}
            step={1000}
            value={[budgetMin, budgetMax]}
            onValueChange={(v) => {
              form.setValue('budgetMin', v[0], { shouldValidate: true });
              form.setValue('budgetMax', v[1], { shouldValidate: true });
            }}
          />
          <p className="mt-2 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
            ₹{budgetMin.toLocaleString('en-IN')} – ₹{budgetMax.toLocaleString('en-IN')}
          </p>
        </div>
        <Controller
          name="moveInDate"
          control={form.control}
          render={({ field }) => (
            <InputDate
              label="I want to move in by"
              min={todayYmd()}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Lifestyle tags ({tags.length}/{MAX_LIFESTYLE_TAGS})
          </p>
          <Controller
            name="lifestyleTags"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-col gap-4">
                {(
                  [
                    ['Vibes', constants.vibes],
                    ['Schedule', constants.schedule],
                    ['Interests', constants.interests],
                    ['Personality', constants.personality],
                  ] as const
                ).map(([label, pool]) => (
                  <div key={label}>
                    <p className="mb-1.5 font-sans text-xs font-medium uppercase tracking-wide text-ink-tertiary dark:text-dark-ink-tertiary">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pool.map((t) => {
                        const selected = field.value.includes(t);
                        const maxed = field.value.length >= MAX_LIFESTYLE_TAGS && !selected;
                        return (
                          <Chip key={t} variant="tag" selected={selected} disabled={maxed} onClick={() => field.onChange(toggleTag(field.value, t))}>
                            {t}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
        <Controller
          name="smokingPref"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="Smoking preference"
              options={['Non-smoker', 'Smoker ok', 'Flexible']}
              value={field.value === 'NON_SMOKER' ? 'Non-smoker' : field.value === 'SMOKER' ? 'Smoker ok' : 'Flexible'}
              onChange={(v) =>
                field.onChange(v === 'Non-smoker' ? 'NON_SMOKER' : v === 'Smoker ok' ? 'SMOKER' : 'FLEXIBLE')
              }
            />
          )}
        />
        <Controller
          name="foodPref"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="Food preference"
              options={['Pure veg', 'Eggetarian', 'Non-veg ok']}
              value={field.value === 'PURE_VEG' ? 'Pure veg' : field.value === 'EGGETARIAN' ? 'Eggetarian' : 'Non-veg ok'}
              onChange={(v) =>
                field.onChange(v === 'Pure veg' ? 'PURE_VEG' : v === 'Eggetarian' ? 'EGGETARIAN' : 'NON_VEG_OK')
              }
            />
          )}
        />
        <Button type="submit" variant="primary" disabled={!form.formState.isValid}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
