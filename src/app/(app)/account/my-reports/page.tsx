'use client';

import { useRouter } from 'next/navigation';
import { BackArrow } from '@/components/ui/BackArrow';
import { Heading } from '@/components/ui/Heading';
import { useMyReportsQuery } from '@/lib/hooks/use-safety';

export default function MyReportsPage() {
  const router = useRouter();
  const { data, isPending } = useMyReportsQuery();
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col px-4 pb-28 pt-2">
      <BackArrow onClick={() => router.push('/account')} />
      <Heading as="h1" size={28} className="mt-4">
        My reports
      </Heading>
      {isPending ? (
        <p className="mt-6 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">You haven&apos;t submitted any reports yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-surface px-4 py-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">{r.reportedUser.fullName}</p>
              <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
                {r.category} · {r.status}
              </p>
              <p className="mt-1 font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">{new Date(r.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
