'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils/cn';
import { timeAgoShort } from '@/lib/utils/time-ago';
import type { ListingWithMatch } from '@/lib/api/listing-types';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { ListingCoverImage } from '@/components/listings/ListingCoverImage';
import { ListingPhotosLightbox } from '@/components/listings/ListingPhotosLightbox';

type ListingCardProps = {
  listing: ListingWithMatch;
  className?: string;
};

function lifestylePreview(listing: ListingWithMatch): string[] {
  const fromProf = listing.preferredProfessions.slice(0, 2);
  const fromAmen = listing.amenities.filter((a) => !fromProf.includes(a)).slice(0, 3 - fromProf.length);
  return [...fromProf, ...fromAmen].slice(0, 3);
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const cover = listing.photos[0];
  const chips = lifestylePreview(listing);
  const lightboxTitle = `₹${listing.yourShare.toLocaleString('en-IN')}/mo · ${listing.bhk} BHK · ${listing.localityName}`;
  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-teal/30 dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-teal/35',
          className,
        )}
      >
        <button
          type="button"
          className="relative block h-[200px] w-full cursor-zoom-in overflow-hidden bg-border text-left dark:bg-dark-border"
          onClick={() => setLightboxOpen(true)}
          aria-label="Expand photos"
        >
          <ListingCoverImage src={cover} sizes="390px" />
        </button>
        <Link
          href={`/listings/${listing.id}` as Route}
          className="block p-4 transition-colors hover:bg-teal-tint/20 dark:hover:bg-dark-teal-tint/15"
        >
          <p className="font-serif text-lg font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
            ₹{listing.yourShare.toLocaleString('en-IN')}/mo · {listing.bhk} BHK
          </p>
          <p className="mt-1 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            {listing.localityName} · {timeAgoShort(listing.createdAt)} ago
          </p>
          {chips.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="inline-flex max-w-full min-h-[34px] items-center truncate rounded-full border border-border bg-transparent px-3.5 font-sans text-[13px] font-medium text-ink-secondary dark:border-dark-border dark:text-dark-ink-secondary"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <VerifiedBadge size={14} companyName={listing.lister.companyVerified ? listing.lister.companyName : undefined} className="min-w-0" />
          </div>
        </Link>
      </div>
      <ListingPhotosLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        photos={listing.photos}
        title={lightboxTitle}
      />
    </>
  );
}
