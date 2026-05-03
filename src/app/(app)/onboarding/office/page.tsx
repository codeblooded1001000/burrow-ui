'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { toast } from '@/components/ui/Toast';
import { OfficeLocationMapPicker, type ValidatedOfficePick } from '@/components/maps/OfficeLocationMapPicker';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { authMeQueryKey } from '@/lib/api/query-keys';
import { fetchCurrentUser } from '@/lib/api/client';
import { usePatchProfileMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { useGetMyProfileQuery } from '@/lib/hooks/use-profiles';

type OfficeDraft = { kind: 'coords'; pick: ValidatedOfficePick } | { kind: 'cleared' } | null;

export default function OnboardingOfficePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const patch = usePatchProfileMutation();
  const profileQ = useGetMyProfileQuery(true);
  const [draft, setDraft] = useState<OfficeDraft>(null);

  const initialLat = profileQ.data?.officeLat ?? null;
  const initialLng = profileQ.data?.officeLng ?? null;

  const finishOnboarding = useCallback(async () => {
    const me = await qc.fetchQuery({
      queryKey: authMeQueryKey,
      queryFn: () => fetchCurrentUser(),
    });
    const role = me.user.role;
    if (role === 'LISTER') {
      router.replace('/listing/new/intro');
      return;
    }
    const completion = me.user.profileCompletion;
    router.replace(completion < 60 ? '/profile/edit/intro' : '/profile/edit/about');
  }, [qc, router]);

  const onSkip = useCallback(() => {
    void finishOnboarding();
  }, [finishOnboarding]);

  const onSave = useCallback(async () => {
    if (!draft) {
      toast.error('Search or tap the map to set your office, or tap Skip for now.');
      return;
    }
    try {
      if (draft.kind === 'cleared') {
        await patch.mutateAsync({ officeLat: null, officeLng: null });
      } else {
        await patch.mutateAsync({ officeLat: draft.pick.lat, officeLng: draft.pick.lng });
      }
      toast.success('Saved.');
      await finishOnboarding();
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  }, [draft, finishOnboarding, patch]);

  return (
    <PhoneShell progress={92} back onBack={() => router.replace('/onboarding/role')}>
      <div className="mt-4 flex flex-col gap-3">
        <Heading size={28}>Where is your office?</Heading>
        <Subhead>Optional — we use it to show drive time from flats you browse. Trust us, it is worth it.</Subhead>
      </div>
      <p className="mt-4 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
        Search for your workplace, or tap the map to drop a pin. We only store coordinates inside Gurgaon / Gurugram.
      </p>
      <div className="mt-6 min-h-0 flex-1">
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
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button type="button" variant="primary" loading={patch.isPending} disabled={!draft} onClick={() => void onSave()}>
          Save and continue
        </Button>
        <Button type="button" variant="tertiary" disabled={patch.isPending} onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </PhoneShell>
  );
}
