'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useReceivedRequestsCountQuery, useUnreadCountQuery } from '@/lib/hooks/messaging';

type BottomNavProps = {
  /** Stub until messaging — shows forest dot when true. */
  hasUnreadMessages?: boolean;
  /** Design QA: force active tab without relying on pathname. */
  activeTab?: 'explore' | 'messages' | 'profile';
  /** When true, bar is positioned at bottom of a relative ancestor (e.g. design preview). */
  contained?: boolean;
};

function exploreActive(pathname: string, isListingEditWizard: boolean): boolean {
  if (isListingEditWizard) return false;
  return (
    pathname.startsWith('/browse') ||
    pathname.startsWith('/listing/new') ||
    pathname.startsWith('/listings/') ||
    pathname.startsWith('/profiles/')
  );
}

function messagesActive(pathname: string): boolean {
  return pathname.startsWith('/inbox');
}

function profileActive(pathname: string, isListingEditWizard: boolean): boolean {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile/edit') ||
    pathname.startsWith('/report/') ||
    pathname.startsWith('/blocked-users') ||
    pathname.startsWith('/listing/edit') ||
    pathname.startsWith('/about') ||
    isListingEditWizard
  );
}

function BottomNavFallback({ contained }: { contained: boolean }) {
  return (
    <nav
      className={cn(
        'bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] dark:border-dark-border dark:bg-dark-surface',
        contained ? 'absolute' : 'fixed',
      )}
      aria-hidden
    />
  );
}

function BottomNavContent({ hasUnreadMessages: hasUnreadProp, activeTab, contained = false }: BottomNavProps) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const isListingEditWizard = pathname.startsWith('/listing/new') && searchParams.get('edit') === '1';
  const { data: unreadData } = useUnreadCountQuery();
  const { data: requestsCount } = useReceivedRequestsCountQuery();
  const unreadActive = unreadData?.count ?? 0;
  const incomingRequests = requestsCount ?? 0;
  const hasUnreadFromQuery = unreadActive + incomingRequests > 0;
  const hasUnreadMessages = hasUnreadProp !== undefined ? hasUnreadProp : hasUnreadFromQuery;

  const explore = activeTab ? activeTab === 'explore' : exploreActive(pathname, isListingEditWizard);
  const messages = activeTab ? activeTab === 'messages' : messagesActive(pathname);
  const profile = activeTab ? activeTab === 'profile' : profileActive(pathname, isListingEditWizard);

  return (
    <nav
      className={cn(
        'bottom-0 left-0 right-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] dark:border-dark-border dark:bg-dark-surface',
        contained ? 'absolute' : 'fixed',
      )}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 w-full max-w-[390px]">
        <Link
          href="/browse"
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35',
            explore ? 'text-teal dark:text-dark-teal' : 'text-ink-secondary dark:text-dark-ink-secondary',
          )}
          aria-current={explore ? 'page' : undefined}
        >
          <span className="relative inline-flex">
            <Compass className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="font-sans text-xs font-medium leading-none">Explore</span>
        </Link>

        <Link
          href="/inbox"
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35',
            messages ? 'text-teal dark:text-dark-teal' : 'text-ink-secondary dark:text-dark-ink-secondary',
          )}
          aria-current={messages ? 'page' : undefined}
        >
          <span className="relative inline-flex">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            {hasUnreadMessages ? (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-forest dark:bg-dark-forest" aria-label="Unread messages" />
            ) : null}
          </span>
          <span className="font-sans text-xs font-medium leading-none">Messages</span>
        </Link>

        <Link
          href="/account"
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35',
            profile ? 'text-teal dark:text-dark-teal' : 'text-ink-secondary dark:text-dark-ink-secondary',
          )}
          aria-current={profile ? 'page' : undefined}
        >
          <User className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-sans text-xs font-medium leading-none">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export function BottomNav(props: BottomNavProps) {
  return (
    <Suspense fallback={<BottomNavFallback contained={props.contained ?? false} />}>
      <BottomNavContent {...props} />
    </Suspense>
  );
}
