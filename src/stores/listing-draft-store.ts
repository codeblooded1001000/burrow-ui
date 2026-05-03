import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ListingDto } from '@/lib/api/listing-types';

export type ListingFlowStep = 'intro' | 'basics' | 'about' | 'looking-for' | 'review';

type ListingDraftState = {
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
  setField: <K extends keyof Omit<ListingDraftState, 'setField' | 'advanceStep' | 'reset' | 'loadFromExisting'>>(
    key: K,
    value: ListingDraftState[K],
  ) => void;
  advanceStep: (s: ListingFlowStep) => void;
  reset: () => void;
  loadFromExisting: (listing: ListingDto) => void;
};

const empty: Omit<
  ListingDraftState,
  'setField' | 'advanceStep' | 'reset' | 'loadFromExisting'
> = {
  step: 'intro',
  localityName: '',
  lat: null,
  lng: null,
  bhk: null,
  totalRent: null,
  yourShare: null,
  availableFrom: '',
  photos: [],
  description: '',
  amenities: [],
  preferredGender: null,
  preferredProfessions: [],
  smokingAllowed: null,
  foodPref: null,
  workSchedulePref: null,
};

export const useListingDraftStore = create<ListingDraftState>()(
  persist(
    (set) => ({
      ...empty,
      setField: (key, value) => set({ [key]: value } as Partial<ListingDraftState>),
      advanceStep: (step) => set({ step }),
      reset: () => set({ ...empty }),
      loadFromExisting: (listing) =>
        set({
          step: 'basics',
          localityName: listing.localityName,
          lat: listing.lat,
          lng: listing.lng,
          bhk: listing.bhk,
          totalRent: listing.totalRent,
          yourShare: listing.yourShare,
          availableFrom: listing.availableFrom,
          photos: [...listing.photos],
          description: listing.description,
          amenities: [...listing.amenities],
          preferredGender: listing.preferredGender,
          preferredProfessions: [...listing.preferredProfessions],
          smokingAllowed: listing.smokingAllowed,
          foodPref: listing.foodPref,
          workSchedulePref: listing.workSchedulePref,
        }),
    }),
    {
      name: 'burrow-listing-draft',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        step: s.step,
        localityName: s.localityName,
        lat: s.lat,
        lng: s.lng,
        bhk: s.bhk,
        totalRent: s.totalRent,
        yourShare: s.yourShare,
        availableFrom: s.availableFrom,
        photos: s.photos,
        description: s.description,
        amenities: s.amenities,
        preferredGender: s.preferredGender,
        preferredProfessions: s.preferredProfessions,
        smokingAllowed: s.smokingAllowed,
        foodPref: s.foodPref,
        workSchedulePref: s.workSchedulePref,
      }),
    },
  ),
);
