'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ConversationSummaryDto } from '@/lib/messaging/types';
import { formatRelativeInbox } from '@/lib/messaging/time';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { useAcceptRequestMutation, useRejectRequestMutation } from '@/lib/hooks/messaging';
import { toast } from '@/components/ui/Toast';
import { useState } from 'react';
import { RejectRequestConfirmModal } from '@/components/messaging/RejectRequestConfirmModal';

export function InboxRequestRow({ conversation }: { conversation: ConversationSummaryDto }) {
  const router = useRouter();
  const accept = useAcceptRequestMutation();
  const reject = useRejectRequestMutation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const { otherParticipant, lastMessage, id } = conversation;
  const preview = lastMessage?.body ?? 'No preview';
  const ts = formatRelativeInbox(lastMessage?.createdAt ?? conversation.lastMessageAt);

  return (
    <>
      <div className="flex gap-2 border-b border-border px-2 py-2 dark:border-dark-border sm:px-4">
        <Link
          href={`/inbox/${id}?status=pending`}
          className="flex min-w-0 flex-1 gap-3 rounded-lg py-2 pl-2 pr-1 transition-colors hover:bg-teal-tint/40 dark:hover:bg-dark-teal-tint/25 sm:pl-0"
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
              <span className="shrink-0 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{ts}</span>
            </div>
            <p className="mt-0.5 line-clamp-1 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{preview}</p>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col justify-center gap-2 pr-1">
          <Button
            type="button"
            variant="primary"
            className="min-h-8 px-3 py-1 text-xs"
            loading={accept.isPending}
            onClick={(e) => {
              e.preventDefault();
              void accept.mutateAsync(id).then(() => {
                toast.success('Request accepted');
                router.push(`/inbox/${id}`);
              });
            }}
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="tertiary"
            className="min-h-8 px-3 py-1 text-xs"
            onClick={(e) => {
              e.preventDefault();
              setRejectOpen(true);
            }}
          >
            Reject
          </Button>
        </div>
      </div>
      <RejectRequestConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        otherName={otherParticipant.fullName}
        loading={reject.isPending}
        onConfirm={async (reason) => {
          try {
            await reject.mutateAsync({ conversationId: id, reason });
            toast('Request rejected');
            setRejectOpen(false);
            router.replace('/inbox?tab=requests');
          } catch {
            toast.error('Could not reject request.');
          }
        }}
      />
    </>
  );
}
