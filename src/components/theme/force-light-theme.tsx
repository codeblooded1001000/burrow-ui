'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/**
 * While `enabled`, sets the document theme to light and restores the prior
 * theme when disabled or unmounted (e.g. leaving auth or onboarding).
 */
export function ForceLightTheme({ enabled }: { enabled: boolean }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!enabled) return;
    const previous = theme;
    setTheme('light');
    return () => {
      setTheme(previous ?? 'system');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read `theme` once when `enabled` becomes true
  }, [enabled, setTheme]);

  return null;
}
