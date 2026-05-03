import { Suspense } from 'react';
import { BrowseClient } from '@/components/browse/BrowseClient';

export default function BrowsePage() {
  return (
    <Suspense fallback={<p className="px-6 py-10 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>}>
      <BrowseClient />
    </Suspense>
  );
}
