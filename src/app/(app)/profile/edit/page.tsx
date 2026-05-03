'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/states/LoadingState';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';

export default function ProfileEditIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAccount = searchParams.get('from') === 'account';
  const { user, isPending } = useCurrentUser();

  useEffect(() => {
    if (isPending || !user) return;
    if (fromAccount && user.hasProfile) {
      router.replace('/profile/edit/about?from=account');
      return;
    }
    if (user.profileCompletion >= 60) {
      router.replace('/profile/edit/about');
    } else {
      router.replace('/profile/edit/intro');
    }
  }, [isPending, router, user, fromAccount]);

  return <LoadingState message="Loading…" />;
}
