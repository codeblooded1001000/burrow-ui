'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ListingImagePlaceholder } from '@/components/listings/ListingImagePlaceholder';
import { resolveMediaRefToPublicUrl } from '@/lib/uploads/resolve-media-public-url';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';

export type ListingPreviewProps = {
  localityName: string;
  bhk: number | null;
  totalRent: number | null;
  yourShare: number | null;
  description: string;
  photos: string[];
  amenities: string[];
};

export function ListingPreviewCard({ localityName, bhk, totalRent, yourShare, description, photos, amenities }: ListingPreviewProps) {
  const coverRef = photos[0]?.trim() ?? '';
  const coverUrl = resolveMediaRefToPublicUrl(coverRef);
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-border dark:bg-dark-border">
        {coverUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- R2 keys resolved to public CDN URLs
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <ListingImagePlaceholder className="absolute inset-0" />
        )}
      </div>
      <div className="p-4">
        <Heading as="h2" size={22}>
          {bhk != null ? `${bhk} BHK` : '—'} · {localityName || 'Locality'}
        </Heading>
        <Subhead className="mt-1">
          {yourShare != null && totalRent != null ? (
            <>
              ₹{yourShare.toLocaleString('en-IN')} / mo · Total ₹{totalRent.toLocaleString('en-IN')}
            </>
          ) : (
            'Rent details'
          )}
        </Subhead>
        <p className="mt-3 line-clamp-4 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{description || 'Description'}</p>
        {amenities.length > 0 ? (
          <p className="mt-2 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{amenities.join(' · ')}</p>
        ) : null}
      </div>
    </Card>
  );
}
