'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/states/LoadingState';
import { ForceLightTheme } from '@/components/theme/force-light-theme';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isPending } = useCurrentUser();

  useEffect(() => {
    if (isPending) return;
    if (data?.user) {
      router.replace('/browse');
    }
  }, [data, isPending, router]);

  if (data?.user) {
    return null;
  }

  return (
    <>
      <ForceLightTheme enabled />
      <AppShell bottomNav={false} topBar="none">
        {isPending ? <LoadingState message="Loading…" /> : children}
      </AppShell>
    </>
  );
}
