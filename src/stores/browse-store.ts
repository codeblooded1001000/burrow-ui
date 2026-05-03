import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BrowseTab = 'flats' | 'flatmates';

export type BrowseView = 'list' | 'map';

export type BrowseFilters = {
  localities: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  gender: 'WOMAN' | 'MAN' | 'ANYONE' | null;
  moveInFrom: string | null;
  moveInTo: string | null;
  bhk: number[];
  smokingPref: 'NON_SMOKER' | 'SMOKER' | 'FLEXIBLE' | null;
  foodPref: 'PURE_VEG' | 'EGGETARIAN' | 'NON_VEG_OK' | null;
  workSchedule: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null;
  lifestyleTags: string[];
  professions: string[];
};

const defaultFilters = (): BrowseFilters => ({
  localities: [],
  budgetMin: null,
  budgetMax: null,
  gender: null,
  moveInFrom: null,
  moveInTo: null,
  bhk: [],
  smokingPref: null,
  foodPref: null,
  workSchedule: null,
  lifestyleTags: [],
  professions: [],
});

type BrowseState = {
  tab: BrowseTab;
  view: BrowseView;
  filters: BrowseFilters;
  setTab: (t: BrowseTab) => void;
  setView: (v: BrowseView) => void;
  setFilter: <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => void;
  setFilters: (patch: Partial<BrowseFilters>) => void;
  clearFilters: () => void;
};

export const useBrowseStore = create<BrowseState>()(
  persist(
    (set) => ({
      tab: 'flats',
      view: 'list',
      filters: defaultFilters(),
      setTab: (tab) => set({ tab }),
      setView: (view) => set({ view }),
      setFilter: (key, value) =>
        set((s) => ({
          filters: { ...s.filters, [key]: value },
        })),
      setFilters: (patch) =>
        set((s) => ({
          filters: { ...s.filters, ...patch },
        })),
      clearFilters: () => set({ filters: defaultFilters() }),
    }),
    {
      name: 'burrow-browse',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tab: s.tab }),
    },
  ),
);
