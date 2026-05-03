import Link from 'next/link';
import type { ReactNode } from 'react';
import { AccountHeaderAvatar } from '@/components/layout/AccountHeaderAvatar';
import { BottomNav } from '@/components/ui/BottomNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Wordmark } from '@/components/brand/Wordmark';

type TopBarOption = 'default' | 'none' | ReactNode;

type AppShellProps = {
  children: ReactNode;
  topBar?: TopBarOption;
  bottomNav?: boolean;
  /** When false, hides the theme toggle in the default header (e.g. onboarding). */
  showThemeToggle?: boolean;
  /** Preview inside a bordered frame — bottom nav is absolute to this shell. */
  contained?: boolean;
};

export function AppShell({
  children,
  topBar = 'default',
  bottomNav = true,
  showThemeToggle = true,
  contained = false,
}: AppShellProps) {
  const shell = (
    <>
      {topBar === 'none' ? null : topBar === 'default' ? (
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 dark:border-dark-border dark:bg-dark-surface">
          <Link href="/browse" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35">
            <Wordmark size={24} />
          </Link>
          <div className="flex items-center gap-2">
            {showThemeToggle ? <ThemeToggle /> : null}
            <AccountHeaderAvatar />
          </div>
        </header>
      ) : (
        topBar
      )}
      <div className="mx-auto w-full max-w-[390px] pb-24">{children}</div>
      {bottomNav ? <BottomNav contained={contained} /> : null}
    </>
  );

  if (contained) {
    return (
      <div className="relative min-h-[560px] overflow-hidden rounded-xl border border-border bg-cream dark:border-dark-border dark:bg-dark-bg">
        {shell}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      {shell}
    </div>
  );
}
