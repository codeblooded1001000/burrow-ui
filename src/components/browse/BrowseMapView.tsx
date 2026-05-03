'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { APIProvider, AdvancedMarker, ColorScheme, Map, useMap } from '@vis.gl/react-google-maps';
import useEmblaCarousel from 'embla-carousel-react';
import { browseMapStyleDark, browseMapStyleLight } from '@/lib/browse/map-styles';
import { getGoogleMapsBrowserKey, getGoogleMapsMapId } from '@/lib/maps/public-map-config';
import type { ListingWithMatch } from '@/lib/api/listing-types';
import { MiniListingCard } from '@/components/listings/MiniListingCard';
import { cn } from '@/lib/utils/cn';

const GURGAON = { lat: 28.4595, lng: 77.0266 };

/** Map fills parent; parent must use real `height` (not only `min-height`) so `h-full` resolves. */
const MAP_HEIGHT = 'h-[min(58dvh,520px)] min-h-[280px]';

function FitBounds({ listings }: { listings: ListingWithMatch[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || listings.length === 0) return;
    if (listings.length === 1) {
      map.panTo({ lat: listings[0].lat, lng: listings[0].lng });
      map.setZoom(14);
      return;
    }
    const b = new google.maps.LatLngBounds();
    for (const l of listings.slice(0, 50)) {
      b.extend({ lat: l.lat, lng: l.lng });
    }
    map.fitBounds(b, { top: 48, right: 16, bottom: 28, left: 16 });
  }, [map, listings]);
  return null;
}

function RecenterEffect({
  listings,
  selectedId,
}: {
  listings: ListingWithMatch[];
  selectedId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    const sel = listings.find((l) => l.id === selectedId);
    if (!map || !sel) return;
    map.panTo({ lat: sel.lat, lng: sel.lng });
  }, [map, listings, selectedId]);
  return null;
}

function MapBody({
  listings,
  selectedId,
  onSelect,
}: {
  listings: ListingWithMatch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const colorScheme = isDark ? ColorScheme.DARK : ColorScheme.LIGHT;
  const mapId = getGoogleMapsMapId();

  const styles = useMemo(() => {
    if (mapId) return undefined;
    const raw = isDark ? browseMapStyleDark : browseMapStyleLight;
    return [...raw] as unknown as NonNullable<google.maps.MapOptions['styles']>;
  }, [mapId, isDark]);

  return (
    <Map
      className="h-full w-full"
      defaultCenter={GURGAON}
      defaultZoom={12}
      colorScheme={colorScheme}
      {...(mapId ? { mapId } : {})}
      {...(styles ? { styles } : {})}
      gestureHandling="greedy"
      mapTypeControl={false}
      streetViewControl={false}
      zoomControl
      fullscreenControl={false}
    >
      <FitBounds listings={listings} />
      <RecenterEffect listings={listings} selectedId={selectedId} />
      {listings.slice(0, 50).map((l) => {
        const k = Math.max(1, Math.round(l.yourShare / 1000));
        const selected = l.id === selectedId;
        return (
          <AdvancedMarker
            key={l.id}
            position={{ lat: l.lat, lng: l.lng }}
            onClick={() => onSelect(l.id)}
            zIndex={selected ? 50 : 10}
          >
            <div
              className={cn(
                'rounded-full border px-2.5 py-1 font-sans text-[12px] font-semibold tabular-nums shadow-md transition-transform duration-200',
                selected
                  ? 'scale-110 border-ink-primary bg-ink-primary text-cream shadow-lg dark:border-dark-ink-primary dark:bg-dark-ink-primary dark:text-dark-bg'
                  : 'border-black/[0.08] bg-white text-ink-primary shadow-lg dark:border-white/12 dark:bg-dark-surface dark:text-dark-ink-primary dark:shadow-black/40',
              )}
            >
              ₹{k}k
            </div>
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}

type BrowseMapViewProps = {
  listings: ListingWithMatch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function BrowseMapView({ listings, selectedId, onSelect }: BrowseMapViewProps) {
  const apiKey = getGoogleMapsBrowserKey();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    slidesToScroll: 1,
  });

  const onSelectCb = useCallback(
    (id: string) => {
      onSelect(id);
      const idx = listings.findIndex((l) => l.id === id);
      if (emblaApi && idx >= 0) emblaApi.scrollTo(idx);
    },
    [emblaApi, listings, onSelect],
  );

  const listingCount = listings.length;
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, listingCount]);

  useEffect(() => {
    if (!emblaApi || !selectedId) return;
    const idx = listings.findIndex((l) => l.id === selectedId);
    if (idx >= 0) emblaApi.scrollTo(idx);
  }, [emblaApi, listings, selectedId]);

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-surface px-4 text-center dark:bg-dark-surface ${MAP_HEIGHT}`}
      >
        <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to load the map.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-4 flex w-[calc(100%+2rem)] flex-col gap-0">
      {/* Explicit height chain: outer → inner → Map h-full */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-border bg-surface dark:border-dark-border dark:bg-dark-surface',
          MAP_HEIGHT,
        )}
      >
        <div className="absolute inset-0">
          <APIProvider apiKey={apiKey}>
            <MapBody listings={listings} selectedId={selectedId} onSelect={onSelectCb} />
          </APIProvider>
        </div>
      </div>

      <div className="mt-3 px-1">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
          <p className="font-sans text-[13px] font-semibold text-ink-primary dark:text-dark-ink-primary">Homes on the map</p>
          <p className="font-sans text-xs tabular-nums text-ink-tertiary dark:text-dark-ink-tertiary">{listings.length} places</p>
        </div>
        <p className="mb-2 px-1 font-sans text-xs leading-snug text-ink-secondary dark:text-dark-ink-secondary">
          Tap a price on the map, tap a card photo to expand it, swipe cards, or use View details for the full listing page.
        </p>
        <div className="-mx-1">
          <div ref={emblaRef} className="cursor-grab overflow-hidden pb-1 active:cursor-grabbing">
            <div className="flex touch-pan-x gap-3 px-1">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="min-w-0 shrink-0 snap-start pl-1 first:pl-3 last:pr-3"
                  style={{ flex: '0 0 min(86vw, 300px)' }}
                >
                  <MiniListingCard
                    listing={l}
                    selected={l.id === selectedId}
                    onSelect={() => onSelectCb(l.id)}
                    className="w-full shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
