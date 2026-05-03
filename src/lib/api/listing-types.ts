/** Mirrors `ListingDto` in `API_CONTRACT.md`. */
export type ListingDto = {
  id: string;
  userId: string;
  localityName: string;
  lat: number;
  lng: number;
  bhk: number;
  totalRent: number;
  yourShare: number;
  availableFrom: string;
  photos: string[];
  description: string;
  amenities: string[];
  preferredGender: 'WOMAN' | 'MAN' | 'ANYONE';
  preferredProfessions: string[];
  smokingAllowed: boolean;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  workSchedulePref: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lister: {
    id: string;
    fullName: string;
    age: number;
    gender: 'WOMAN' | 'MAN' | 'PREFER_NOT';
    photoUrl: string | null;
    profession: string | null;
    companyName: string;
    companyVerified: boolean;
  };
};

export type ConstantsDto = {
  localities: string[];
  vibes: string[];
  schedule: string[];
  interests: string[];
  personality: string[];
  professions: string[];
  amenities: string[];
};

export type ListingPhotoUploadUrlResponse = {
  uploadUrl: string;
  key: string;
  expiresAt: string;
};

/** Public profile (GET /profiles/:userId) — no office coordinates. */
export type ProfilePublicDto = {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: 'WOMAN' | 'MAN' | 'PREFER_NOT';
  photoUrl: string | null;
  bio: string;
  profession: string | null;
  workSchedule: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string | null;
  preferredLocalities: string[];
  lifestyleTags: string[];
  smokingPref: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  user: { id: string; companyName: string; companyVerified: boolean };
};

export type ListingWithMatch = ListingDto & { matchScore: number };

export type ProfileWithMatch = ProfilePublicDto & { matchScore: number };

export type BrowseFlatsResponse = {
  items: ListingWithMatch[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type BrowseFlatmatesResponse = {
  items: ProfileWithMatch[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ProfileOwnDto = {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: 'WOMAN' | 'MAN' | 'PREFER_NOT';
  photoUrl: string | null;
  bio: string;
  profession: string | null;
  workSchedule: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string | null;
  preferredLocalities: string[];
  lifestyleTags: string[];
  smokingPref: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  user: { id: string; companyName: string; companyVerified: boolean };
  officeLat: number | null;
  officeLng: number | null;
};
