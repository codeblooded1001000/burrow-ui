'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';

export default function ReportSubmittedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] flex-col items-center px-6 pb-28 pt-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/15 text-forest dark:bg-dark-forest/20 dark:text-dark-forest">
        <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
      </div>
      <Heading as="h1" size={24} className="mt-8 font-serif">
        Report submitted
      </Heading>
      <Subhead className="mt-3 max-w-[320px]">We&apos;ll review within 24 hours. You won&apos;t see them again.</Subhead>
      <div className="mt-10 flex w-full max-w-[320px] flex-col gap-3">
        <Button type="button" variant="primary" onClick={() => router.push('/browse')}>
          Done
        </Button>
        <Button type="button" variant="tertiary" className="self-center" as={Link} href="/account/my-reports">
          View my reports
        </Button>
      </div>
    </div>
  );
}
