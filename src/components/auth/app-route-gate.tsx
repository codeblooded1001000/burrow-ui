'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';

export function AppRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, user, isPending, error, refetch } = useCurrentUser();

  useEffect(() => {
    if (isPending) return;
    if (!data?.user) {
      router.replace('/login');
      return;
    }
    if (user?.role === null && !pathname.startsWith('/onboarding')) {
      router.replace('/onboarding/basics');
    }
  }, [data, isPending, pathname, router, user?.role]);

  if (isPending) {
    return <LoadingState message="Loading…" />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data?.user) {
    return null;
  }

  if (user?.role === null && !pathname.startsWith('/onboarding')) {
    return null;
  }

  return <>{children}</>;
}
