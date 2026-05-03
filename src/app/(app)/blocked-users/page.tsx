'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass } from 'lucide-react';
import { BackArrow } from '@/components/ui/BackArrow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Modal } from '@/components/ui/Modal';
import { Subhead } from '@/components/ui/Subhead';
import { toast } from '@/components/ui/Toast';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useBlockedUsersQuery, useUnblockMutation } from '@/lib/hooks/use-safety';

export default function BlockedUsersPage() {
  const router = useRouter();
  const { data, isPending } = useBlockedUsersQuery();
  const unblock = useUnblockMutation();
  const [confirmUser, setConfirmUser] = useState<{ id: string; fullName: string } | null>(null);

  const items = data?.items ?? [];
  const n = items.length;

  return (
    <div className="flex flex-col px-4 pb-28 pt-2">
      <BackArrow onClick={() => router.push('/account')} />
      <Heading as="h1" size={28} className="mt-4">
        Blocked users
      </Heading>
      <Subhead className="mt-2">{n === 1 ? '1 person blocked' : `${n} people blocked`}</Subhead>

      {isPending ? (
        <p className="mt-8 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      ) : n === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Compass className="h-10 w-10 text-ink-tertiary dark:text-dark-ink-tertiary" strokeWidth={1.5} aria-hidden />
          <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">You haven&apos;t blocked anyone.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 dark:border-dark-border dark:bg-dark-surface"
            >
              <Avatar src={row.blockedUser.photoUrl} alt={row.blockedUser.fullName} size={48} />
              <span className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">
                {row.blockedUser.fullName}
              </span>
              <Button type="button" variant="tertiary" size="sm" className="shrink-0" onClick={() => setConfirmUser(row.blockedUser)}>
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(confirmUser)}
        onOpenChange={(o) => {
          if (!o) setConfirmUser(null);
        }}
        title={confirmUser ? `Unblock ${confirmUser.fullName}?` : 'Unblock'}
        description="They'll be able to see your profile and message you again."
        footer={
          <>
            <Button
              type="button"
              variant="primary"
              loading={unblock.isPending}
              onClick={async () => {
                if (!confirmUser) return;
                try {
                  await unblock.mutateAsync(confirmUser.id);
                  toast.success('Unblocked');
                  setConfirmUser(null);
                } catch (e) {
                  toast.error(friendlyMessageForError(e));
                }
              }}
            >
              Unblock
            </Button>
            <Button type="button" variant="secondary" disabled={unblock.isPending} onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
          </>
        }
      />
    </div>
  );
}
