/**
 * Client validation aligned with `burrow-api/src/listings/schemas/listings.schemas.ts`.
 */
import { z } from 'zod';
import { MAX_RENT, MIN_RENT } from '@/lib/constants';

export function buildLocalitySchema(localities: readonly string[]) {
  const set = new Set(localities);
  return z.string().refine((v) => set.has(v), { message: 'Pick a Gurgaon locality from the list.' });
}

export function buildAmenitiesSchema(amenities: readonly string[]) {
  const set = new Set(amenities);
  return z
    .array(z.string())
    .refine((arr) => arr.every((a) => set.has(a)), { message: 'Each amenity must be from the list.' });
}

export function buildProfessionsSchema(professions: readonly string[]) {
  const set = new Set(professions);
  return z
    .array(z.string())
    .max(20)
    .refine((arr) => arr.every((p) => set.has(p)), { message: 'Each profession must be from the curated list.' });
}

const availableFromSchema = z.string().refine(
  (s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return false;
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return d >= start;
  },
  { message: 'Choose today or a future date.' },
);

export function listingBasicsSchema(localities: readonly string[]) {
  return z
    .object({
      localityName: buildLocalitySchema(localities),
      lat: z.number().finite(),
      lng: z.number().finite(),
      bhk: z.coerce.number().int().min(1).max(5),
      totalRent: z.coerce.number().int().min(MIN_RENT).max(MAX_RENT),
      yourShare: z.coerce.number().int().min(MIN_RENT).max(MAX_RENT),
      availableFrom: availableFromSchema,
    })
    .refine((d) => d.yourShare <= d.totalRent, {
      message: "Your share can't be more than total rent.",
      path: ['yourShare'],
    });
}

export const listingAboutSchema = z.object({
  description: z.string().min(1).max(1000),
});

export const listingLookingSchema = z.object({
  preferredGender: z.enum(['WOMAN', 'MAN', 'ANYONE']),
  preferredProfessions: z.array(z.string()),
  smokingAllowed: z.boolean(),
  foodPref: z.enum(['PURE_VEG', 'EGGETARIAN', 'NON_VEG_OK']).nullable().optional(),
  workSchedulePref: z.enum(['HOME', 'OFFICE', 'FLEXIBLE']).nullable().optional(),
});

export type ListingBasicsInput = z.infer<ReturnType<typeof listingBasicsSchema>>;
export type ListingAboutInput = z.infer<typeof listingAboutSchema>;
export type ListingLookingInput = z.infer<typeof listingLookingSchema>;
