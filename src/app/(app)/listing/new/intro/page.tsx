'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { useListingDraftStore } from '@/stores/listing-draft-store';

export default function ListingIntroPage() {
  const router = useRouter();
  const advanceStep = useListingDraftStore((s) => s.advanceStep);

  return (
    <PhoneShell showProgress={false}>
      <div className="mt-12 flex flex-col gap-3">
        <Heading size={32}>Tell us about your flat.</Heading>
        <Subhead>Takes about 3 minutes. You can save and continue later.</Subhead>
      </div>
      <div className="mt-16 flex flex-col gap-4">
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            advanceStep('basics');
            router.push('/listing/new/basics');
          }}
        >
          Get started
        </Button>
        <Button type="button" variant="secondary" as={Link} href="/browse">
          I will do this later
        </Button>
      </div>
    </PhoneShell>
  );
}
