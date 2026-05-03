'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { APIProvider, AdvancedMarker, ColorScheme, Map } from '@vis.gl/react-google-maps';
import { browseMapStyleDark, browseMapStyleLight } from '@/lib/browse/map-styles';
import { getGoogleMapsBrowserKey, getGoogleMapsMapId } from '@/lib/maps/public-map-config';

type ListingMapPreviewProps = {
  lat: number;
  lng: number;
};

/** Small non-interactive map preview for listing detail. */
export function ListingMapPreview({ lat, lng }: ListingMapPreviewProps) {
  const apiKey = getGoogleMapsBrowserKey();
  const mapId = getGoogleMapsMapId();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const colorScheme = isDark ? ColorScheme.DARK : ColorScheme.LIGHT;

  const styles = useMemo(() => {
    if (mapId) return undefined;
    const raw = isDark ? browseMapStyleDark : browseMapStyleLight;
    return [...raw] as unknown as NonNullable<google.maps.MapOptions['styles']>;
  }, [mapId, isDark]);

  if (!apiKey) {
    return (
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[200px] w-full items-center justify-center rounded-xl border border-border bg-surface font-sans text-sm text-teal underline dark:border-dark-border dark:bg-dark-surface dark:text-dark-teal"
      >
        Get directions
      </a>
    );
  }

  return (
    <div className="h-[200px] w-full overflow-hidden rounded-xl border border-border dark:border-dark-border">
      <APIProvider apiKey={apiKey}>
        <Map
          className="h-full w-full"
          center={{ lat, lng }}
          zoom={15}
          colorScheme={colorScheme}
          {...(mapId ? { mapId } : {})}
          {...(styles ? { styles } : {})}
          gestureHandling="none"
          zoomControl={false}
          mapTypeControl={false}
          streetViewControl={false}
          disableDefaultUI
        >
          <AdvancedMarker position={{ lat, lng }}>
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-ink-primary shadow-md dark:border-dark-surface dark:bg-dark-ink-primary" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
