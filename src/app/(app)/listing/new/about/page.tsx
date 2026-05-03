'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { useGetConstantsQuery } from '@/lib/hooks/use-constants';
import { useUploadPhoto } from '@/lib/hooks/use-upload-photo';
import { MAX_PHOTOS_PER_LISTING } from '@/lib/constants';
import { resolveMediaRefToPublicUrl } from '@/lib/uploads/resolve-media-public-url';
import { useListingDraftStore } from '@/stores/listing-draft-store';
import { withListingEdit } from '@/lib/listing/listing-edit-query';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function buildAboutSchema(amenities: readonly string[]) {
  const set = new Set(amenities);
  return z.object({
    description: z.string().min(1).max(1000),
    amenities: z.array(z.string()).refine((arr) => arr.every((a) => set.has(a)), { message: 'Invalid amenity' }),
  });
}

type AboutForm = z.infer<ReturnType<typeof buildAboutSchema>>;

export default function ListingAboutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { data: constants } = useGetConstantsQuery();
  const setField = useListingDraftStore((s) => s.setField);
  const advanceStep = useListingDraftStore((s) => s.advanceStep);
  const draft = useListingDraftStore();
  const { upload, isUploading } = useUploadPhoto();

  const schema = useMemo(() => (constants?.amenities.length ? buildAboutSchema(constants.amenities) : null), [constants?.amenities]);

  const form = useForm<AboutForm>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: {
      description: draft.description || '',
      amenities: draft.amenities?.length ? draft.amenities : [],
    },
  });

  const photos = draft.photos;

  const addPhoto = async (file: File) => {
    if (photos.length >= MAX_PHOTOS_PER_LISTING) return;
    const url = await upload(file);
    setField('photos', [...photos, url]);
  };

  const removePhoto = (idx: number) => {
    setField(
      'photos',
      photos.filter((_, i) => i !== idx),
    );
  };

  const toggleAmenity = (a: string, cur: string[]) => {
    return cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a];
  };

  if (!constants || !schema) {
    return (
      <PhoneShell progress={40} back onBack={() => router.push(withListingEdit('/listing/new/basics', isEdit))}>
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell progress={40} back onBack={() => router.push(withListingEdit('/listing/new/basics', isEdit))}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>Show your flat</Heading>
        <Subhead>Add photos, a short description, and what the flat offers.</Subhead>
      </div>
      <form
        className="mt-8 flex flex-col gap-6"
        onSubmit={form.handleSubmit((v) => {
          setField('description', v.description);
          setField('amenities', v.amenities);
          advanceStep('looking-for');
          router.push(withListingEdit('/listing/new/looking-for', isEdit));
        })}
      >
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Photos (up to {MAX_PHOTOS_PER_LISTING})</p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: MAX_PHOTOS_PER_LISTING }).map((_, i) => {
              const ref = photos[i];
              const previewUrl = ref ? resolveMediaRefToPublicUrl(ref) : null;
              return (
                <Card key={i} className="relative flex aspect-square items-center justify-center overflow-hidden border-2 border-dashed border-teal/80 bg-transparent p-0 dark:border-dark-teal/80">
                  {previewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-surface/90 p-1 text-ink-primary shadow dark:bg-dark-surface/90 dark:text-dark-ink-primary"
                        aria-label="Remove photo"
                        onClick={() => removePhoto(i)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 font-sans text-[10px] text-white">Cover</span>
                      ) : null}
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) void addPhoto(f);
                        }}
                      />
                      <span className="text-teal dark:text-dark-teal">+</span>
                      <span className="text-center font-sans text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary">Add</span>
                    </label>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="desc" className="mb-2 block font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Description
          </label>
          <textarea
            id="desc"
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            {...form.register('description')}
          />
          <p className="mt-1 text-right font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{form.watch('description').length}/1000</p>
          {form.formState.errors.description?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.description.message}</p>
          ) : null}
        </div>
        <div>
          <p className="mb-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Amenities</p>
          <Controller
            name="amenities"
            control={form.control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {constants.amenities.map((a) => {
                  const on = field.value.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => field.onChange(toggleAmenity(a, field.value))}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-left font-sans text-xs transition-colors',
                        on
                          ? 'border-teal bg-teal-tint text-teal dark:border-dark-teal dark:bg-dark-teal-tint dark:text-dark-teal'
                          : 'border-border text-ink-secondary dark:border-dark-border dark:text-dark-ink-secondary',
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
        <Button type="submit" variant="primary" disabled={!form.formState.isValid || photos.length === 0}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
