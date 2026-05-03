'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PlacePickerModal } from '@/components/listings/place-picker-modal';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Pill } from '@/components/ui/Pill';
import { Subhead } from '@/components/ui/Subhead';
import { useGetConstantsQuery } from '@/lib/hooks/use-constants';
import { listingBasicsSchema, type ListingBasicsInput } from '@/lib/schemas/listing.schemas';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import { withListingEdit } from '@/lib/listing/listing-edit-query';

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bhkToLabel(b: number): string {
  return b === 5 ? '5+' : String(b);
}

function labelToBhk(l: string): number {
  return l === '5+' ? 5 : Number(l);
}

export default function ListingBasicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { data: constants, isPending: constPending } = useGetConstantsQuery();
  const setField = useListingDraftStore((s) => s.setField);
  const advanceStep = useListingDraftStore((s) => s.advanceStep);
  const draft = useListingDraftStore();
  const [pinOpen, setPinOpen] = useState(false);

  const schema = useMemo(() => {
    if (!constants?.localities.length) return null;
    return listingBasicsSchema(constants.localities);
  }, [constants?.localities]);

  const form = useForm<ListingBasicsInput>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: {
      localityName: draft.localityName || '',
      lat: draft.lat ?? 28.4595,
      lng: draft.lng ?? 77.0266,
      bhk: draft.bhk ?? 2,
      totalRent: draft.totalRent ?? undefined,
      yourShare: draft.yourShare ?? undefined,
      availableFrom: draft.availableFrom || todayYmd(),
    },
  });

  const bhkVal = form.watch('bhk');
  const bhkLabel = bhkToLabel(bhkVal);

  const onSubmit = form.handleSubmit((values) => {
    setField('localityName', values.localityName);
    setField('lat', values.lat);
    setField('lng', values.lng);
    setField('bhk', values.bhk);
    setField('totalRent', values.totalRent);
    setField('yourShare', values.yourShare);
    setField('availableFrom', new Date(`${values.availableFrom}T00:00:00.000Z`).toISOString());
    advanceStep('about');
    router.push(withListingEdit('/listing/new/about', isEdit));
  });

  if (constPending || !constants || !schema) {
    return (
      <PhoneShell progress={20} back onBack={() => router.push(isEdit ? '/account' : '/listing/new/intro')}>
        <p className="mt-8 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell progress={20} back onBack={() => router.push(isEdit ? '/account' : '/listing/new/intro')}>
      <PlacePickerModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        onPick={(lat, lng) => {
          form.setValue('lat', lat, { shouldValidate: true });
          form.setValue('lng', lng, { shouldValidate: true });
        }}
      />
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>Where is your flat?</Heading>
        <Subhead>Pick your society area and pin the building if you can.</Subhead>
      </div>
      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="locality" className="mb-2 block font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Locality
          </label>
          <select
            id="locality"
            className="h-14 w-full rounded-xl border border-border bg-surface px-4 font-sans text-base text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            {...form.register('localityName')}
          >
            <option value="">Select locality</option>
            {constants.localities.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {form.formState.errors.localityName?.message ? (
            <p className="mt-1 font-sans text-sm text-red-600 dark:text-red-400">{form.formState.errors.localityName.message}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="tertiary" className="w-auto" onClick={() => setPinOpen(true)}>
            Drop pin for exact location
          </Button>
          {form.watch('lat') != null && form.watch('lng') != null ? (
            <span className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">Location set</span>
          ) : null}
        </div>
        {form.formState.errors.lat?.message ? (
          <p className="font-sans text-sm text-red-600 dark:text-red-400">{form.formState.errors.lat.message}</p>
        ) : null}
        <Controller
          name="bhk"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="BHK"
              options={['1', '2', '3', '4', '5+']}
              value={bhkLabel}
              onChange={(v) => field.onChange(labelToBhk(String(v)))}
            />
          )}
        />
        <Input
          label="Total rent (₹)"
          type="number"
          inputMode="numeric"
          error={form.formState.errors.totalRent?.message}
          {...form.register('totalRent', { valueAsNumber: true })}
        />
        <Input
          label="Your share (₹)"
          type="number"
          inputMode="numeric"
          microcopy="What you will pay each month"
          error={form.formState.errors.yourShare?.message}
          {...form.register('yourShare', { valueAsNumber: true })}
        />
        <Input label="Available from" type="date" min={todayYmd()} error={form.formState.errors.availableFrom?.message} {...form.register('availableFrom')} />
        <Button type="submit" variant="primary" disabled={!form.formState.isValid}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
