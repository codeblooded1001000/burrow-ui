'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ListingImagePlaceholder } from '@/components/listings/ListingImagePlaceholder';
import { resolveMediaRefToPublicUrl } from '@/lib/uploads/resolve-media-public-url';

type ListingCoverImageProps = {
  src: string | null | undefined;
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Listing hero/cover: building placeholder when URL missing, empty, or image fails to load.
 */
export function ListingCoverImage({ src, alt = '', sizes, className, priority }: ListingCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === 'string' ? src.trim() : '';
  const resolved = resolveMediaRefToPublicUrl(trimmed);

  if (!resolved || failed) {
    return <ListingImagePlaceholder className={cn('absolute inset-0', className)} />;
  }

  return (
    // Native <img>: R2 keys are resolved to public CDN URLs; full https refs pass through unchanged.
    // referrerPolicy avoids some CDNs returning 403 when the app is embedded or referrers are stripped oddly.
    <img
      src={resolved}
      alt={alt}
      sizes={sizes}
      referrerPolicy="no-referrer"
      fetchPriority={priority ? 'high' : undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('pointer-events-none absolute inset-0 z-0 block h-full w-full min-h-0 min-w-0 object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}
