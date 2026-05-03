import type { BasicsInput } from '@/lib/schemas/auth.schemas';

/** Minimal valid `PUT /profiles/me` body after onboarding basics (rest filled in F3). */
export type ProfilePutPayload = {
  fullName: string;
  age: number;
  gender: BasicsInput['gender'];
  photoUrl?: string | null;
  bio: string;
  preferredLocalities: string[];
  lifestyleTags: string[];
};

export function buildProfilePutFromBasics(basics: BasicsInput, photoUrl: string | null = null): ProfilePutPayload {
  return {
    fullName: basics.fullName,
    age: basics.age,
    gender: basics.gender,
    photoUrl: photoUrl ?? null,
    bio: '',
    preferredLocalities: [],
    lifestyleTags: [],
  };
}
