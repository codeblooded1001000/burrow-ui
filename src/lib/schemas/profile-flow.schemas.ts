/**
 * Profile edit flow — align with `burrow-api/src/profiles/schemas/profiles.schemas.ts`.
 */
import { z } from 'zod';
import { MAX_LIFESTYLE_TAGS } from '@/lib/constants';

export function buildPreferredLocalitiesSchema(localities: readonly string[]) {
  const set = new Set(localities);
  return z
    .array(z.string())
    .max(40)
    .refine((arr) => arr.every((x) => set.has(x)), { message: 'Each locality must be from the list.' });
}

export function buildLifestyleTagsSchema(allTags: readonly string[]) {
  const set = new Set(allTags);
  return z
    .array(z.string())
    .max(MAX_LIFESTYLE_TAGS)
    .refine((arr) => arr.every((t) => set.has(t)), { message: 'Invalid lifestyle tag.' });
}

export const profileAboutSchema = z.object({
  bio: z.string().max(500),
  profession: z.string().max(120),
  workSchedule: z.enum(['HOME', 'OFFICE', 'FLEXIBLE']).nullable().optional(),
});

export function profilePreferencesSchema(localities: readonly string[], lifestylePool: readonly string[]) {
  return z
    .object({
      preferredLocalities: buildPreferredLocalitiesSchema(localities).refine((a) => a.length >= 1, {
        message: 'Pick at least one locality.',
      }),
      budgetMin: z.coerce.number().int().min(5000).max(100000),
      budgetMax: z.coerce.number().int().min(5000).max(100000),
      moveInDate: z.string().min(1),
      lifestyleTags: buildLifestyleTagsSchema(lifestylePool),
      smokingPref: z.enum(['NON_SMOKER', 'SMOKER', 'FLEXIBLE']).nullable().optional(),
      foodPref: z.enum(['PURE_VEG', 'EGGETARIAN', 'NON_VEG_OK']).nullable().optional(),
    })
    .refine((d) => d.budgetMin <= d.budgetMax, {
      message: 'Minimum budget must be less than or equal to maximum.',
      path: ['budgetMin'],
    });
}

export type ProfileAboutForm = z.infer<typeof profileAboutSchema>;
export type ProfilePreferencesForm = z.infer<ReturnType<typeof profilePreferencesSchema>>;

export const phoneLocalSchema = z.object({
  local: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'),
});
