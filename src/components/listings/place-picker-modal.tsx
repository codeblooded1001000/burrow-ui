'use client';

import { useCallback, useRef, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type PlacePickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (lat: number, lng: number) => void;
};

const libraries = ['places'] as ('places')[];

function GooglePlacesBody({ onPick, onClose }: { onPick: (lat: number, lng: number) => void; onClose: () => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'burrow-google-maps',
    googleMapsApiKey: apiKey,
    libraries,
  });
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = useCallback(() => {
    const ac = acRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const loc = place.geometry?.location;
    if (!loc) return;
    onPick(loc.lat(), loc.lng());
    onClose();
  }, [onClose, onPick]);

  if (loadError || !isLoaded) {
    return <p className="text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading maps…</p>;
  }

  return (
    <Autocomplete
      onLoad={(ac) => {
        acRef.current = ac;
      }}
      onPlaceChanged={onPlaceChanged}
      options={{ fields: ['geometry', 'formatted_address'], types: ['geocode'] }}
    >
      <input
        placeholder="Search for an address"
        className="h-12 w-full rounded-xl border border-border bg-surface px-3 font-sans text-base text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:focus:border-dark-teal"
      />
    </Autocomplete>
  );
}

function ManualCoordsBody({ onPick, onClose }: { onPick: (lat: number, lng: number) => void; onClose: () => void }) {
  const [manualLat, setManualLat] = useState('28.4595');
  const [manualLng, setManualLng] = useState('77.0266');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-secondary dark:text-dark-ink-secondary">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for address search, or enter coordinates for development.
      </p>
      <Input label="Latitude" value={manualLat} onChange={(e) => setManualLat(e.target.value)} />
      <Input label="Longitude" value={manualLng} onChange={(e) => setManualLng(e.target.value)} />
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          const lat = Number(manualLat);
          const lng = Number(manualLng);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          onPick(lat, lng);
          onClose();
        }}
      >
        Use these coordinates
      </Button>
    </div>
  );
}

export function PlacePickerModal({ open, onOpenChange, onPick }: PlacePickerModalProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const onClose = () => onOpenChange(false);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Drop pin for exact location" description="Search for an address to save latitude and longitude.">
      {apiKey ? <GooglePlacesBody onPick={onPick} onClose={onClose} /> : <ManualCoordsBody onPick={onPick} onClose={onClose} />}
    </Modal>
  );
}
