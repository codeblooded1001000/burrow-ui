import type { ProfileOwnDto } from '@/lib/api/listing-types';

export type FullProfilePutBody = {
  fullName: string;
  age: number;
  gender: 'WOMAN' | 'MAN' | 'PREFER_NOT';
  photoUrl?: string | null;
  bio: string;
  profession?: string | null;
  workSchedule?: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  moveInDate?: string | null;
  preferredLocalities: string[];
  lifestyleTags: string[];
  smokingPref?: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref?: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  officeLat?: number | null;
  officeLng?: number | null;
};

type Draft = {
  bio: string;
  profession: string;
  workSchedule: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  preferredLocalities: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string;
  lifestyleTags: string[];
  smokingPref: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  pendingPhotoKey: string | null;
};

export function buildFullProfilePut(existing: ProfileOwnDto, draft: Draft): FullProfilePutBody {
  const moveInIso = draft.moveInDate ? new Date(draft.moveInDate).toISOString() : null;
  const photoUrl =
    draft.pendingPhotoKey != null && draft.pendingPhotoKey.trim().length > 0
      ? draft.pendingPhotoKey.trim()
      : existing.photoUrl;
  return {
    fullName: existing.fullName,
    age: existing.age,
    gender: existing.gender,
    photoUrl,
    bio: draft.bio,
    profession: draft.profession.trim() === '' ? null : draft.profession,
    workSchedule: draft.workSchedule,
    budgetMin: draft.budgetMin,
    budgetMax: draft.budgetMax,
    moveInDate: moveInIso,
    preferredLocalities: draft.preferredLocalities,
    lifestyleTags: draft.lifestyleTags,
    smokingPref: draft.smokingPref,
    foodPref: draft.foodPref,
    officeLat: existing.officeLat,
    officeLng: existing.officeLng,
  };
}
