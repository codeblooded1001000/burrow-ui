import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProfileOwnDto } from '@/lib/api/listing-types';

export type ProfileFlowStep = 'intro' | 'about' | 'preferences' | 'review';

type ProfileDraftState = {
  step: ProfileFlowStep;
  bio: string;
  profession: string;
  workSchedule: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  phoneLocal: string;
  preferredLocalities: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: string;
  lifestyleTags: string[];
  smokingPref: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  /** New R2 object key after upload; `null` = keep server photo until save. */
  pendingPhotoKey: string | null;
  setField: <K extends keyof Omit<ProfileDraftState, 'setField' | 'advanceStep' | 'reset' | 'loadFromProfile'>>(
    key: K,
    value: ProfileDraftState[K],
  ) => void;
  advanceStep: (s: ProfileFlowStep) => void;
  reset: () => void;
  loadFromProfile: (p: ProfileOwnDto) => void;
};

const empty: Omit<ProfileDraftState, 'setField' | 'advanceStep' | 'reset' | 'loadFromProfile'> = {
  step: 'intro',
  bio: '',
  profession: '',
  workSchedule: null,
  phoneLocal: '',
  preferredLocalities: [],
  budgetMin: null,
  budgetMax: null,
  moveInDate: '',
  lifestyleTags: [],
  smokingPref: null,
  foodPref: null,
  pendingPhotoKey: null,
};

export const useProfileDraftStore = create<ProfileDraftState>()(
  persist(
    (set) => ({
      ...empty,
      setField: (key, value) => set({ [key]: value } as Partial<ProfileDraftState>),
      advanceStep: (step) => set({ step }),
      reset: () => set({ ...empty }),
      loadFromProfile: (p) =>
        set({
          bio: p.bio,
          profession: p.profession ?? '',
          workSchedule: p.workSchedule,
          phoneLocal: '',
          preferredLocalities: [...p.preferredLocalities],
          budgetMin: p.budgetMin,
          budgetMax: p.budgetMax,
          moveInDate: p.moveInDate ?? '',
          lifestyleTags: [...p.lifestyleTags],
          smokingPref: p.smokingPref,
          foodPref: p.foodPref,
        }),
    }),
    {
      name: 'burrow-profile-draft',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0 && persisted && typeof persisted === 'object' && 'pendingPhotoKey' in persisted) {
          const { pendingPhotoKey: _stale, ...rest } = persisted as Record<string, unknown>;
          return rest;
        }
        return persisted;
      },
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        step: s.step,
        bio: s.bio,
        profession: s.profession,
        workSchedule: s.workSchedule,
        phoneLocal: s.phoneLocal,
        preferredLocalities: s.preferredLocalities,
        budgetMin: s.budgetMin,
        budgetMax: s.budgetMax,
        moveInDate: s.moveInDate,
        lifestyleTags: s.lifestyleTags,
        smokingPref: s.smokingPref,
        foodPref: s.foodPref,
        // Do not persist: stale keys override the real profile photo after refresh / edit-from-account.
      }),
    },
  ),
);
