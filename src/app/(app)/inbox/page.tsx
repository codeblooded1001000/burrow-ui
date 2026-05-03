import { Suspense } from 'react';
import { InboxScreen } from '@/components/messaging/inbox-screen';

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading inbox…</div>
      }
    >
      <InboxScreen />
    </Suspense>
  );
}
