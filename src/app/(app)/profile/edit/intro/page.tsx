'use client';

import { useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { useProfileDraftStore } from '@/stores/profile-draft-store';

export default function ProfileEditIntroPage() {
  const router = useRouter();
  const advanceStep = useProfileDraftStore((s) => s.advanceStep);

  return (
    <PhoneShell showProgress={false}>
      <div className="mt-12 flex flex-col gap-3">
        <Heading size={32}>Tell flatmates about yourself.</Heading>
        <Subhead>This is what they will see when they consider you as a flatmate.</Subhead>
      </div>
      <div className="mt-16">
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            advanceStep('about');
            router.push('/profile/edit/about');
          }}
        >
          Get started
        </Button>
      </div>
    </PhoneShell>
  );
}
