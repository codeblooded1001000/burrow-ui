'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { formatDriveDuration, formatRoadDistance } from '@/lib/maps/format-commute';
import { useCommuteQuery } from '@/lib/hooks/use-commute';

type ListingCommuteBlockProps = {
  listingId: string;
};

export function ListingCommuteBlock({ listingId }: ListingCommuteBlockProps) {
  const { data, isLoading, isError } = useCommuteQuery(listingId, true);

  if (isLoading) {
    return (
      <section className="mt-8" aria-busy="true">
        <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Your commute</h2>
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-border dark:bg-dark-border" />
      </section>
    );
  }

  if (isError || !data) {
    return null;
  }

  if (data.reason === 'NO_OFFICE_SET') {
    return (
      <section className="mt-8">
        <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Your commute</h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
          Add your office once, and we will show drive time from flats like this one. Optional — you can add it in{' '}
          <Link href={'/settings/office' as Route} className="font-medium text-teal underline dark:text-dark-teal">
            Settings → Office location
          </Link>
          .
        </p>
      </section>
    );
  }

  if (data.commute) {
    const c = data.commute;
    const mins = formatDriveDuration(c.durationInTrafficSeconds);
    const dist = formatRoadDistance(c.distanceMeters);
    const isApprox = data.reason === 'ESTIMATE' || c.mode === 'straight_line';
    return (
      <section className="mt-8">
        <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Your commute</h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
          {isApprox ? (
            <>
              Approximate trip from this flat to your office: about{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{mins}</span> ·{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{dist}</span> (rough geometry-based estimate — not live traffic).
            </>
          ) : (
            <>
              Typical drive from this flat to your office: about{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{mins}</span> in current traffic ·{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{dist}</span>. Estimates are for driving and can change with road conditions.
            </>
          )}
        </p>
        {isApprox ? (
          <p className="mt-2 font-sans text-[11px] leading-relaxed text-ink-tertiary dark:text-dark-ink-tertiary">
            Live Google drive times are unavailable (often a server API key or Distance Matrix billing issue). This line is a rough stand-in until that is fixed.
          </p>
        ) : null}
        <p className="mt-2 font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
          Wrong office? Update it in{' '}
          <Link href={'/settings/office' as Route} className="text-teal underline dark:text-dark-teal">
            Settings
          </Link>
          .
        </p>
      </section>
    );
  }

  if (data.reason === 'API_ERROR' || data.reason === 'BUDGET_EXCEEDED') {
    return (
      <section className="mt-8">
        <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Your commute</h2>
        <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Commute estimates are temporarily unavailable. You can still open directions from the map above.
        </p>
      </section>
    );
  }

  return null;
}
