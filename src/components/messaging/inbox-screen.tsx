'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { useConversationsQuery, useReceivedRequestsCountQuery, useSentRequestsQuery } from '@/lib/hooks/messaging';
import { ConversationListItem } from '@/components/messaging/conversation-list-item';
import { InboxRequestRow } from '@/components/messaging/inbox-request-row';
import { parseConversationTab, type ConversationTabParam } from '@/lib/messaging/conversation-tab';
import { cn } from '@/lib/utils/cn';

function InboxRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-3 dark:border-dark-border">
      <Skeleton width={48} height={48} radius={24} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <Skeleton width="55%" height={16} radius={6} />
        <Skeleton width="85%" height={12} radius={6} />
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative flex-1 rounded-full px-3 py-2 font-sans text-sm font-medium transition-colors',
        active
          ? 'bg-teal text-cream shadow-sm dark:bg-dark-teal dark:text-dark-bg'
          : 'text-ink-secondary hover:bg-teal-tint/50 dark:text-dark-ink-secondary dark:hover:bg-dark-teal-tint/25',
      )}
    >
      <span className="flex items-center justify-center gap-1.5">
        {label}
        {badge !== undefined && badge > 0 ? (
          <span
            className={cn(
              'inline-flex min-w-[1.25rem] justify-center rounded-full px-1 font-sans text-[11px] font-semibold leading-tight',
              active ? 'bg-cream/25 text-cream dark:bg-dark-bg/20 dark:text-dark-bg' : 'bg-forest/15 text-forest dark:bg-dark-forest/25 dark:text-dark-forest',
            )}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function InboxScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseConversationTab(searchParams.get('tab'));

  const setTab = (next: ConversationTabParam) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === 'active') sp.delete('tab');
    else sp.set('tab', next);
    const q = sp.toString();
    router.replace(q ? `/inbox?${q}` : '/inbox');
  };

  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const messagesQ = useConversationsQuery('active');
  const requestsQ = useConversationsQuery('requests');
  const { data: sentData } = useSentRequestsQuery();
  const { data: incomingCount } = useReceivedRequestsCountQuery();

  const activeQuery = tab === 'requests' ? requestsQ : messagesQ;
  const { data, isPending, isError, refetch } = activeQuery;

  const requestBadgeCount = incomingCount ?? 0;
  const sentPendingCount = sentData?.items.length ?? 0;

  const rows = useMemo(() => {
    const pages = data?.pages ?? [];
    const items = pages.flatMap((p) => p.items);
    if (tab === 'requests') return items;
    const needle = q.trim().toLowerCase();
    const filtered = !needle ? items : items.filter((c) => c.otherParticipant.fullName.toLowerCase().includes(needle));

    const byOther = new Map<string, (typeof filtered)[number]>();
    for (const c of filtered) {
      const oid = c.otherParticipant.id;
      const prev = byOther.get(oid);
      if (!prev) {
        byOther.set(oid, c);
        continue;
      }
      const tNew = c.lastMessageAt ?? c.createdAt;
      const tOld = prev.lastMessageAt ?? prev.createdAt;
      if (tNew > tOld) {
        byOther.set(oid, c);
      }
    }
    return Array.from(byOther.values()).sort((a, b) => {
      const ta = a.lastMessageAt ?? a.createdAt;
      const tb = b.lastMessageAt ?? b.createdAt;
      return tb.localeCompare(ta);
    });
  }, [data, q, tab]);

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <Heading size={24}>Inbox</Heading>
          <button
            type="button"
            className="rounded-full p-2 text-ink-secondary hover:bg-teal-tint/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-secondary dark:hover:bg-dark-teal-tint/30 dark:focus-visible:ring-dark-teal/35"
            aria-label={searchOpen ? 'Close search' : 'Search conversations'}
            onClick={() => {
              setSearchOpen((v) => !v);
              if (searchOpen) setQ('');
            }}
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="mt-3 flex rounded-full border border-border bg-surface p-1 dark:border-dark-border dark:bg-dark-surface" role="tablist" aria-label="Inbox sections">
          <TabButton active={tab === 'active'} label="Messages" onClick={() => setTab('active')} />
          <TabButton
            active={tab === 'requests'}
            label="Requests"
            badge={requestBadgeCount}
            onClick={() => setTab('requests')}
          />
        </div>
        {tab === 'active' ? (
          <div className="mt-2 flex justify-end">
            <Link
              href="/inbox/sent"
              className="font-sans text-sm font-medium text-teal hover:underline dark:text-dark-teal"
            >
              Sent Requests{sentPendingCount > 0 ? ` · ${sentPendingCount > 99 ? '99+' : sentPendingCount}` : ''}
            </Link>
          </div>
        ) : null}
      </div>

      {searchOpen && tab === 'active' ? (
        <div className="px-4 pb-3">
          <label htmlFor="inbox-search" className="sr-only">
            Filter by name
          </label>
          <input
            id="inbox-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
          />
        </div>
      ) : null}

      {isPending ? (
        <div className="border-t border-border dark:border-dark-border">
          <InboxRowSkeleton />
          <InboxRowSkeleton />
          <InboxRowSkeleton />
          <InboxRowSkeleton />
          <InboxRowSkeleton />
        </div>
      ) : null}

      {isError ? (
        <div className="px-4 py-8 text-center font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Could not load conversations.{' '}
          <button type="button" className="text-teal underline dark:text-dark-teal" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 && tab === 'active' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="No conversations yet"
            description="When someone accepts your request or you get a match, it'll appear here."
            actionLabel="Browse listings"
            actionVariant="tertiary"
            onAction={() => router.push('/browse')}
          />
        </div>
      ) : null}

      {!isPending && !isError && rows.length === 0 && tab === 'requests' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="No requests right now"
            description="When someone wants to start a conversation, you'll see it here."
            actionLabel="Browse listings"
            actionVariant="tertiary"
            onAction={() => router.push('/browse')}
          />
        </div>
      ) : null}

      {!isPending && !isError && rows.length > 0 && tab === 'active' ? (
        <div className="border-t border-border dark:border-dark-border">
          {rows.map((c) => (
            <ConversationListItem key={c.id} conversation={c} />
          ))}
        </div>
      ) : null}

      {!isPending && !isError && rows.length > 0 && tab === 'requests' ? (
        <div className="border-t border-border dark:border-dark-border">
          {rows.map((c) => (
            <InboxRequestRow key={c.id} conversation={c} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
