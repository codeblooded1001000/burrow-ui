import { create } from 'zustand';

type SseState = {
  connected: boolean;
  setConnected: (connected: boolean) => void;
};

export const useSseStore = create<SseState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
