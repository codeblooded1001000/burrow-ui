'use client';

import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="px-6 py-10">
      <Heading size={28}>About Burrow</Heading>
      <Subhead className="mt-3">Verified flatmate matching for Gurgaon professionals. Full marketing site coming soon.</Subhead>
      <Button as={Link} href="/account" variant="tertiary" className="mt-8 self-start">
        Back to account
      </Button>
    </div>
  );
}
