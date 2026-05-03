'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils/cn';
import { ListingCoverImage } from '@/components/listings/ListingCoverImage';
import { ListingPhotosLightbox } from '@/components/listings/ListingPhotosLightbox';
import type { ListingWithMatch } from '@/lib/api/listing-types';

type MiniListingCardProps = {
  listing: ListingWithMatch;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

export function MiniListingCard({ listing, selected, onSelect, className }: MiniListingCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const cover = listing.photos[0];
  const k = Math.max(1, Math.round(listing.yourShare / 1000));
  const lightboxTitle = `${listing.bhk} BHK · ${listing.localityName} · ₹${k}k`;

  return (
    <>
      <div
        className={cn(
          'flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl border bg-surface text-left transition-colors dark:bg-dark-surface',
          selected ? 'border-2 border-teal shadow-sm dark:border-dark-teal' : 'border-border opacity-90 dark:border-dark-border',
          className,
        )}
      >
        <button
          type="button"
          className="relative aspect-[5/3] w-full cursor-zoom-in overflow-hidden bg-border text-left dark:bg-dark-border"
          onClick={() => setLightboxOpen(true)}
          aria-label="Expand photos"
        >
          <ListingCoverImage src={cover} sizes="(max-width: 390px) 86vw, 300px" />
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 z-10 rounded-full bg-teal/95 px-2 py-0.5 font-sans text-[11px] font-semibold text-cream dark:bg-dark-teal/95 dark:text-dark-bg">
            ₹{k}k
          </span>
        </button>
        <button type="button" onClick={onSelect} className="w-full px-2 pb-2 pt-1.5 text-left">
          <p className="truncate font-serif text-sm font-medium text-ink-primary dark:text-dark-ink-primary">
            {listing.bhk} BHK · {listing.localityName}
          </p>
        </button>
        <Link
          href={`/listings/${listing.id}` as Route}
          className="border-t border-border px-2 py-2 text-center font-sans text-xs font-semibold text-teal hover:bg-teal/5 dark:border-dark-border dark:text-dark-teal dark:hover:bg-dark-teal/10"
        >
          View details
        </Link>
      </div>
      <ListingPhotosLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} photos={listing.photos} title={lightboxTitle} />
    </>
  );
}
