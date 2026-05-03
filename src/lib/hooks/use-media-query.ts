'use client';

import { useEffect, useState } from 'react';

/** Stub for responsive hooks — implement when needed. */
export function useMediaQuery(_query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    setMatches(false);
  }, []);

  return matches;
}
