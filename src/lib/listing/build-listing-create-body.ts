import type { ListingCreateBody } from '@/lib/hooks/use-listings';
import type { ListingFlowStep } from '@/stores/listing-draft-store';

type DraftFields = {
  step: ListingFlowStep;
  localityName: string;
  lat: number | null;
  lng: number | null;
  bhk: number | null;
  totalRent: number | null;
  yourShare: number | null;
  availableFrom: string;
  photos: string[];
  description: string;
  amenities: string[];
  preferredGender: 'WOMAN' | 'MAN' | 'ANYONE' | null;
  preferredProfessions: string[];
  smokingAllowed: boolean | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  workSchedulePref: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
};

export function buildListingCreateBody(d: DraftFields): ListingCreateBody {
  if (d.lat == null || d.lng == null) throw new Error('Choose a location on the map.');
  if (d.bhk == null || d.totalRent == null || d.yourShare == null) throw new Error('Complete all fields.');
  if (!d.preferredGender) throw new Error('Choose who you are looking for.');
  if (d.smokingAllowed === null) throw new Error('Set smoking preference.');

  const availableFrom = new Date(d.availableFrom).toISOString();

  return {
    localityName: d.localityName,
    lat: d.lat,
    lng: d.lng,
    bhk: d.bhk,
    totalRent: d.totalRent,
    yourShare: d.yourShare,
    availableFrom,
    photos: d.photos,
    description: d.description,
    amenities: d.amenities,
    preferredGender: d.preferredGender,
    preferredProfessions: d.preferredProfessions,
    smokingAllowed: d.smokingAllowed,
    foodPref: d.foodPref ?? null,
    workSchedulePref: d.workSchedulePref ?? null,
  };
}
