'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackArrow } from '@/components/ui/BackArrow';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { toast } from '@/components/ui/Toast';
import { OfficeLocationMapPicker, type ValidatedOfficePick } from '@/components/maps/OfficeLocationMapPicker';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { usePatchProfileMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { useGetMyProfileQuery } from '@/lib/hooks/use-profiles';

type OfficeDraft = { kind: 'coords'; pick: ValidatedOfficePick } | { kind: 'cleared' } | null;

export default function SettingsOfficePage() {
  const router = useRouter();
  const patch = usePatchProfileMutation();
  const profileQ = useGetMyProfileQuery(true);
  const [draft, setDraft] = useState<OfficeDraft>(null);

  const initialLat = profileQ.data?.officeLat ?? null;
  const initialLng = profileQ.data?.officeLng ?? null;
  const hasSavedOffice =
    initialLat != null && initialLng != null && Number.isFinite(initialLat) && Number.isFinite(initialLng);

  const onSave = useCallback(async () => {
    if (!draft) {
      toast.error('Change your pin or clear it before saving.');
      return;
    }
    try {
      if (draft.kind === 'cleared') {
        await patch.mutateAsync({ officeLat: null, officeLng: null });
        toast.success('Office location removed.');
      } else {
        await patch.mutateAsync({ officeLat: draft.pick.lat, officeLng: draft.pick.lng });
        toast.success('Office location saved.');
      }
      router.push('/settings');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  }, [draft, patch, router]);

  return (
    <div className="flex flex-col px-4 pb-28 pt-2">
      <BackArrow onClick={() => router.push('/settings')} />
      <Heading as="h1" className="mt-4" size={28}>
        Office location
      </Heading>
      <Subhead className="mt-2">
        We use this to estimate drive time from flats you open. Optional — change or remove anytime.
      </Subhead>
      <div className="mt-6">
        {profileQ.isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-border dark:bg-dark-border" />
        ) : (
          <OfficeLocationMapPicker
            initialLat={initialLat}
            initialLng={initialLng}
            onPick={(pick) => setDraft({ kind: 'coords', pick })}
            onClear={() => setDraft({ kind: 'cleared' })}
          />
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" variant="primary" loading={patch.isPending} disabled={!draft} onClick={() => void onSave()}>
          Save
        </Button>
        {hasSavedOffice ? (
          <p className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">
            Use &quot;Clear pin&quot; above, then Save, to remove your office from Burrow.
          </p>
        ) : null}
      </div>
    </div>
  );
}
