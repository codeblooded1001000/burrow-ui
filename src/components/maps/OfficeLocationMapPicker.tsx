'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { toast } from '@/components/ui/Toast';
import { validateOfficePlace } from '@/lib/api/maps-client';
import { getGoogleMapsBrowserKey } from '@/lib/maps/public-map-config';
import { cn } from '@/lib/utils/cn';

const GURGAON = { lat: 28.4595, lng: 77.0266 };
/** Biases suggestions toward NCR; `validate-place` still enforces Gurgaon / Gurugram server-side. */
const NCR_SEARCH_BIAS: google.maps.LatLngBoundsLiteral = {
  north: 28.65,
  south: 28.28,
  east: 77.35,
  west: 76.75,
};
const libraries = ['places'] as ['places'];

const mapContainerStyle: CSSProperties = {
  width: '100%',
  height: 'min(42dvh, 320px)',
  minHeight: 220,
  borderRadius: 12,
};

export type ValidatedOfficePick = { lat: number; lng: number; formattedAddress: string };

type OfficeLocationMapPickerProps = {
  initialLat?: number | null;
  initialLng?: number | null;
  onPick: (pick: ValidatedOfficePick) => void;
  onClear?: () => void;
  className?: string;
};

async function validateFromPlaceId(placeId: string): Promise<ValidatedOfficePick | null> {
  try {
    const res = await validateOfficePlace(placeId);
    if (res.valid) {
      return { lat: res.lat, lng: res.lng, formattedAddress: res.formattedAddress };
    }
    if (res.reason === 'OUT_OF_BOUNDS') {
      toast.error('That place is outside Gurgaon / Gurugram. Try another address.');
    } else {
      toast.error('Could not verify that place. Try again or pick another spot.');
    }
  } catch {
    toast.error('Could not verify that place. Check your connection and try again.');
  }
  return null;
}

function MapPickerBody({
  initialLat,
  initialLng,
  onPick,
  onClear,
  className,
}: OfficeLocationMapPickerProps) {
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLine, setAddressLine] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(GURGAON);

  useEffect(() => {
    if (
      initialLat != null &&
      initialLng != null &&
      Number.isFinite(initialLat) &&
      Number.isFinite(initialLng)
    ) {
      const p = { lat: initialLat, lng: initialLng };
      setMarker(p);
      setMapCenter(p);
      setAddressLine('Current saved office');
    } else {
      setMarker(null);
      setMapCenter(GURGAON);
      setAddressLine(null);
    }
  }, [initialLat, initialLng]);

  const applyPick = useCallback(
    (pick: ValidatedOfficePick) => {
      setMarker({ lat: pick.lat, lng: pick.lng });
      setMapCenter({ lat: pick.lat, lng: pick.lng });
      setAddressLine(pick.formattedAddress);
      onPick(pick);
    },
    [onPick],
  );

  const onPlaceChanged = useCallback(() => {
    const ac = acRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const placeId = place?.place_id;
    if (!placeId) {
      toast.error('Choose an address from the suggestions list.');
      return;
    }
    void (async () => {
      const pick = await validateFromPlaceId(placeId);
      if (pick) applyPick(pick);
    })();
  }, [applyPick]);

  const geocodeAndValidate = useCallback(
    (lat: number, lng: number) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status !== 'OK' || !results?.[0]?.place_id) {
          toast.error('Could not find an address here. Try the search box instead.');
          return;
        }
        void (async () => {
          const pick = await validateFromPlaceId(results[0].place_id);
          if (pick) applyPick(pick);
        })();
      });
    },
    [applyPick],
  );

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng;
      if (!ll) return;
      geocodeAndValidate(ll.lat(), ll.lng());
    },
    [geocodeAndValidate],
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng;
      if (!ll) return;
      geocodeAndValidate(ll.lat(), ll.lng());
    },
    [geocodeAndValidate],
  );

  const handleClear = useCallback(() => {
    setMarker(null);
    setAddressLine(null);
    setMapCenter(GURGAON);
    onClear?.();
  }, [onClear]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Autocomplete
        onLoad={(ac) => {
          acRef.current = ac;
        }}
        onPlaceChanged={onPlaceChanged}
        options={{
          fields: ['geometry', 'formatted_address', 'place_id', 'name'],
          componentRestrictions: { country: 'in' },
          bounds: NCR_SEARCH_BIAS,
        }}
      >
        <input
          type="text"
          placeholder="Search building, street, or landmark…"
          className="h-12 w-full rounded-xl border border-border bg-surface px-3 font-sans text-base text-ink-primary outline-none placeholder:text-ink-tertiary focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:placeholder:text-dark-ink-tertiary dark:focus:border-dark-teal"
          autoComplete="off"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={marker ? 15 : 12}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {marker ? (
          <Marker
            position={marker}
            draggable
            onDragEnd={onMarkerDragEnd}
            title="Drag to adjust your office"
          />
        ) : null}
      </GoogleMap>
      {addressLine ? (
        <p className="font-sans text-xs leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{addressLine}</p>
      ) : (
        <p className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">Tap the map or search to drop your office pin.</p>
      )}
      {marker ? (
        <button
          type="button"
          className="self-start font-sans text-xs font-medium text-teal underline dark:text-dark-teal"
          onClick={handleClear}
        >
          Clear pin
        </button>
      ) : null}
    </div>
  );
}

export function OfficeLocationMapPicker(props: OfficeLocationMapPickerProps) {
  const apiKey = getGoogleMapsBrowserKey();

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
        <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Google Maps is not configured in this build, so you cannot pick a location on the map here. You can still
          continue — add your office later from Settings → Office location.
        </p>
      </div>
    );
  }

  return <OfficeLocationMapPickerLoaded {...props} />;
}

function OfficeLocationMapPickerLoaded(props: OfficeLocationMapPickerProps) {
  const apiKey = getGoogleMapsBrowserKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'burrow-google-maps',
    googleMapsApiKey: apiKey,
    libraries,
  });

  if (loadError || !isLoaded) {
    return <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading maps…</p>;
  }

  return <MapPickerBody {...props} />;
}
