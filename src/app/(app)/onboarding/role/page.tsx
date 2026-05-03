'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { authMeQueryKey } from '@/lib/api/query-keys';
import { fetchCurrentUser } from '@/lib/api/client';
import { buildProfilePutFromBasics } from '@/lib/profile/build-onboarding-profile';
import { useUpdateProfileMutation, useUpdateRoleMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { useOnboardingStore } from '@/stores/onboarding-store';

type RoleChoice = 'LISTER' | 'SEEKER' | 'BOTH';

const ROLES: { id: RoleChoice; title: string; subtitle: string }[] = [
  { id: 'LISTER', title: 'I have a flat', subtitle: 'Looking for a flatmate to share it' },
  { id: 'SEEKER', title: "I'm looking for a flat", subtitle: 'I want to find a place or join an existing one' },
  { id: 'BOTH', title: "I'm flexible", subtitle: 'Open to either — show me both' },
];

export default function OnboardingRolePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const basics = useOnboardingStore((s) => s.basics);
  const reset = useOnboardingStore((s) => s.reset);
  const [selected, setSelected] = useState<RoleChoice | null>(null);
  const updateRole = useUpdateRoleMutation();
  const updateProfile = useUpdateProfileMutation();

  const onContinue = async () => {
    if (!selected || !basics) {
      if (!basics) router.replace('/onboarding/basics');
      return;
    }
    try {
      await updateRole.mutateAsync({ role: selected });
      await updateProfile.mutateAsync(buildProfilePutFromBasics(basics));
      reset();
      await qc.fetchQuery({
        queryKey: authMeQueryKey,
        queryFn: () => fetchCurrentUser(),
      });
      router.push('/onboarding/office');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  };

  return (
    <PhoneShell progress={83} back onBack={() => router.push('/onboarding/basics')}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>What brings you here?</Heading>
        <Subhead>You can change this anytime.</Subhead>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {ROLES.map((r) => (
          <Card
            key={r.id}
            variant="selectable"
            aria-label={`Select role: ${r.title}`}
            selected={selected === r.id}
            onSelect={() => setSelected(r.id)}
          >
            <p className="font-serif text-lg font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">{r.title}</p>
            <p className="mt-1.5 font-sans text-sm leading-normal text-ink-secondary dark:text-dark-ink-secondary">{r.subtitle}</p>
          </Card>
        ))}
      </div>
      <div className="mt-auto pt-8">
        <Button type="button" variant="primary" loading={updateRole.isPending || updateProfile.isPending} disabled={!selected} onClick={() => void onContinue()}>
          Continue
        </Button>
      </div>
    </PhoneShell>
  );
}
