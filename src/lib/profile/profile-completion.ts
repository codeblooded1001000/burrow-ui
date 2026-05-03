/** Mirrors `burrow-api/src/profiles/profile-completion.ts`. */

export type ProfileCompletionInput = {
  photoUrl: string | null | undefined;
  bio: string | null | undefined;
  profession: string | null | undefined;
  budgetMin: number | null | undefined;
  budgetMax: number | null | undefined;
  moveInDate: string | null | undefined;
  lifestyleTags: string[];
};

export type ProfileCompletionUserInput = {
  phoneVerified: boolean;
};

export function computeProfileCompletion(p: ProfileCompletionInput, user: ProfileCompletionUserInput): number {
  let score = 0;
  if (p.photoUrl && p.photoUrl.trim().length > 0) score += 20;
  if (p.bio && p.bio.trim().length >= 40) score += 10;
  if (p.profession && p.profession.trim().length > 0) score += 20;
  if (p.budgetMin != null && p.budgetMax != null) score += 20;
  if (p.moveInDate) score += 10;
  if (p.lifestyleTags.length >= 1) score += 10;
  if (user.phoneVerified) score += 10;
  return Math.min(100, score);
}
