'use client';

import { useEffect } from 'react';
import { useBrowseStore } from '@/stores/browse-store';

const STORAGE_KEY = 'burrow-browse-tab-user';

/**
 * When the signed-in user changes, align default tab with role (LISTER → flatmates, else flats).
 * Returning users keep their persisted tab from Zustand.
 */
export function useBrowseTabBootstrap(userId: string | undefined, role: 'LISTER' | 'SEEKER' | 'BOTH' | null | undefined): void {
  useEffect(() => {
    if (!userId || role == null) return;
    try {
      const prev = localStorage.getItem(STORAGE_KEY);
      if (prev !== userId) {
        useBrowseStore.getState().setTab(role === 'LISTER' ? 'flatmates' : 'flats');
        localStorage.setItem(STORAGE_KEY, userId);
      }
    } catch {
      /* private mode */
    }
  }, [userId, role]);
}
