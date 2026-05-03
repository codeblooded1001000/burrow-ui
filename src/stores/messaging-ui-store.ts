import { create } from 'zustand';

type MessagingUiState = {
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  /** When set, conversation page should open number-share confirm modal once. */
  openNumberShareConfirmForConversationId: string | null;
  setOpenNumberShareConfirmForConversationId: (id: string | null) => void;
};

export const useMessagingUiStore = create<MessagingUiState>((set) => ({
  activeThreadId: null,
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  openNumberShareConfirmForConversationId: null,
  setOpenNumberShareConfirmForConversationId: (id) => set({ openNumberShareConfirmForConversationId: id }),
}));
