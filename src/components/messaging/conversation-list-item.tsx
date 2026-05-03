'use client';

import Link from 'next/link';
import type { ConversationSummaryDto } from '@/lib/messaging/types';
import { formatRelativeInbox } from '@/lib/messaging/time';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';

export type ConversationListItemProps = {
  conversation: ConversationSummaryDto;
};

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const { otherParticipant, lastMessage, unreadCount, id } = conversation;
  const preview = lastMessage?.body ?? 'No messages yet';
  const ts = formatRelativeInbox(lastMessage?.createdAt ?? conversation.lastMessageAt);

  return (
    <Link
      href={`/inbox/${id}`}
      className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-teal-tint/40 dark:border-dark-border dark:hover:bg-dark-teal-tint/25"
    >
      <Avatar src={otherParticipant.photoUrl} alt={otherParticipant.fullName} fallbackLetter={otherParticipant.fullName} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="truncate font-sans text-base font-medium text-ink-primary dark:text-dark-ink-primary">
              {otherParticipant.fullName}
            </span>
            {otherParticipant.companyVerified ? (
              <VerifiedBadge size={14} companyName={otherParticipant.companyName} className="shrink-0" />
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{ts}</span>
            {unreadCount > 0 ? (
              <span className="h-2 w-2 rounded-full bg-forest dark:bg-dark-forest" aria-label="Unread" />
            ) : null}
          </div>
        </div>
        <p className="mt-0.5 line-clamp-1 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{preview}</p>
      </div>
    </Link>
  );
}
