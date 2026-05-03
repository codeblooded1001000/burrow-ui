'use client';

import { usePathname } from 'next/navigation';
import { AppRouteGate } from '@/components/auth/app-route-gate';
import { AppShell } from '@/components/layout/AppShell';
import { ForceLightTheme } from '@/components/theme/force-light-theme';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith('/onboarding');
  const isOnboarding = hideNav;
  const isInboxThread = /^\/inbox\/[^/]+$/.test(pathname);
  return (
    <>
      <ForceLightTheme enabled={isOnboarding} />
      <AppShell bottomNav={!hideNav} showThemeToggle={!isOnboarding} topBar={isInboxThread ? 'none' : 'default'}>
        <AppRouteGate>{children}</AppRouteGate>
      </AppShell>
    </>
  );
}
