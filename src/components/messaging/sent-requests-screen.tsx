'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { useSentRequestsQuery } from '@/lib/hooks/messaging';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { formatRelativeInbox } from '@/lib/messaging/time';

export function SentRequestsScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useSentRequestsQuery();
  const items = data?.items ?? [];

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <button
          type="button"
          className="rounded-full p-2 text-ink-primary hover:bg-teal-tint/40 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25"
          aria-label="Back to inbox"
          onClick={() => router.push('/inbox')}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <Heading size={24}>Sent requests</Heading>
      </div>

      {isPending ? (
        <div className="border-t border-border px-4 py-3 dark:border-dark-border">
          <Skeleton width="100%" height={56} radius={12} className="mb-3" />
          <Skeleton width="100%" height={56} radius={12} />
        </div>
      ) : null}

      {isError ? (
        <div className="px-4 py-8 text-center font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Could not load sent requests.{' '}
          <button type="button" className="text-teal underline dark:text-dark-teal" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isPending && !isError && items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
          <EmptyState
            title="No pending requests"
            description="When you message someone first, you'll see it here while you wait for a reply."
            actionLabel="Browse listings"
            actionVariant="tertiary"
            onAction={() => router.push('/browse')}
          />
        </div>
      ) : null}

      {!isPending && !isError && items.length > 0 ? (
        <div className="border-t border-border dark:border-dark-border">
          {items.map((c) => {
            const ts = formatRelativeInbox(c.lastMessage?.createdAt ?? c.createdAt);
            return (
              <Link
                key={c.id}
                href={`/inbox/${c.id}`}
                className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-teal-tint/40 dark:border-dark-border dark:hover:bg-dark-teal-tint/25"
              >
                <Avatar
                  src={c.otherParticipant.photoUrl}
                  alt={c.otherParticipant.fullName}
                  fallbackLetter={c.otherParticipant.fullName}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="truncate font-sans text-base font-medium text-ink-primary dark:text-dark-ink-primary">
                        {c.otherParticipant.fullName}
                      </span>
                      {c.otherParticipant.companyVerified ? (
                        <VerifiedBadge size={14} companyName={c.otherParticipant.companyName} className="shrink-0" />
                      ) : null}
                    </div>
                    <span className="shrink-0 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{ts}</span>
                  </div>
                  <p className="mt-0.5 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Awaiting reply</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
