'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ListingImagePlaceholder } from '@/components/listings/ListingImagePlaceholder';
import { ListingCoverImage } from '@/components/listings/ListingCoverImage';

type ListingPhotoCarouselProps = {
  photos: string[];
  className?: string;
  /** Height of each slide (default matches listing detail hero). */
  slideHeightClass?: string;
};

export function ListingPhotoCarousel({ photos, className, slideHeightClass = 'h-[320px]' }: ListingPhotoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: photos.length > 1 });
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (photos.length === 0) {
    return (
      <div className={cn('relative w-full overflow-hidden', slideHeightClass, className)}>
        <ListingImagePlaceholder />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((src, i) => (
            <div key={`${src}-${i}`} className="relative min-w-0 flex-[0_0_100%]">
              <div className={cn('relative w-full overflow-hidden bg-border dark:bg-dark-border', slideHeightClass)}>
                <ListingCoverImage src={src} sizes="390px" priority={i === 0} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {photos.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i === index ? 'bg-cream dark:bg-dark-bg' : 'bg-cream/50 dark:bg-dark-bg/50',
              )}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
