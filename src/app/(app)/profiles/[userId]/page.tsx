'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import { SendMessageModal } from '@/components/messaging/SendMessageModal';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { BlockConfirmModal } from '@/components/safety/BlockConfirmModal';
import { toast } from '@/components/ui/Toast';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { ApiError } from '@/lib/api/client';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { useBlockMutation } from '@/lib/hooks/use-safety';
import { useConversationLookupQuery } from '@/lib/hooks/messaging';
import { useProfilePublicQuery } from '@/lib/hooks/use-profile-public';

function formatMoveIn(iso: string | null): string {
  if (!iso) return 'Flexible';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Flexible';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function workLabel(w: 'HOME' | 'OFFICE' | 'FLEXIBLE' | null): string {
  if (!w) return 'Not specified';
  if (w === 'HOME') return 'Mostly home';
  if (w === 'OFFICE') return 'Mostly office';
  return 'Flexible schedule';
}

export default function ProfileDetailPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { userId } = params;
  const { user } = useCurrentUser();
  const { data: p, isLoading, error } = useProfilePublicQuery(userId);
  const lookup = useConversationLookupQuery(userId);
  const [msgOpen, setMsgOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const blockMut = useBlockMutation();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 px-4 py-10">
        <div className="mx-auto h-[120px] w-[120px] rounded-full bg-border dark:bg-dark-border" />
        <div className="mx-auto h-6 w-40 rounded bg-border dark:bg-dark-border" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="px-4 py-10">
        <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          {error instanceof ApiError ? error.message : 'Profile not found.'}
        </p>
        <Button type="button" variant="tertiary" className="mt-4" onClick={() => router.push('/browse')}>
          Back to browse
        </Button>
      </div>
    );
  }

  const budget =
    p.budgetMin != null && p.budgetMax != null
      ? `₹${p.budgetMin.toLocaleString('en-IN')} – ₹${p.budgetMax.toLocaleString('en-IN')} per month`
      : 'Budget not specified';

  const isSelf = user?.id === p.userId;
  const existingConversationId =
    lookup.isSuccess && lookup.data?.conversationId ? lookup.data.conversationId : null;

  return (
    <div className="pb-28">
      <div className="flex flex-col items-center px-4 pt-8">
        <Avatar src={p.photoUrl} alt={p.fullName} fallbackLetter={p.fullName} size={120} className="ring-2 ring-border dark:ring-dark-border" />
        <Heading as="h1" size={22} className="mt-4 text-center">
          {p.fullName}, {p.age}
        </Heading>
        <div className="mt-2">
          <VerifiedBadge size={18} companyName={p.user.companyVerified ? p.user.companyName : undefined} />
        </div>
      </div>

      <div className="mt-8 space-y-8 px-4">
        <section>
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">About</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{p.bio}</p>
        </section>
        <section>
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Profession</h2>
          <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{p.profession ?? '—'}</p>
          <p className="mt-1 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{workLabel(p.workSchedule)}</p>
        </section>
        <section>
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Looking for</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{budget}</p>
          <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Localities: {p.preferredLocalities.length ? p.preferredLocalities.join(', ') : '—'}
          </p>
          <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Move-in by {formatMoveIn(p.moveInDate)}</p>
          {p.lifestyleTags.length > 0 ? (
            <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Tags: {p.lifestyleTags.join(', ')}</p>
          ) : null}
        </section>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 mx-auto flex max-w-[390px] items-center gap-2 border-t border-border bg-cream/95 px-4 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
        {!isSelf ? (
          existingConversationId ? (
            <Button as={Link} href={`/inbox/${existingConversationId}` as Route} variant="primary" className="flex-1">
              Continue conversation
            </Button>
          ) : (
            <Button type="button" variant="primary" className="flex-1" onClick={() => setMsgOpen(true)}>
              Send message
            </Button>
          )
        ) : (
          <div className="flex-1" aria-hidden />
        )}
        <div className="relative">
          {!isSelf ? (
            <button
              type="button"
              aria-label="More actions"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border dark:border-dark-border"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-5 w-5 text-ink-primary dark:text-dark-ink-primary" strokeWidth={1.75} />
            </button>
          ) : null}
          {menuOpen && !isSelf ? (
            <div className="absolute bottom-full right-0 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg dark:border-dark-border dark:bg-dark-surface">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left font-sans text-sm text-ink-primary hover:bg-teal-tint dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint"
                onClick={() => {
                  setMenuOpen(false);
                  setBlockOpen(true);
                }}
              >
                Block
              </button>
              <Link
                href={`/report/${p.userId}`}
                className="block px-3 py-2 font-sans text-sm text-ink-primary hover:bg-teal-tint dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint"
                onClick={() => setMenuOpen(false)}
              >
                Report
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <SendMessageModal
        open={msgOpen}
        onOpenChange={setMsgOpen}
        recipientUserId={p.userId}
        recipientName={p.fullName}
      />

      <BlockConfirmModal
        user={{ id: p.userId, fullName: p.fullName }}
        open={blockOpen}
        onOpenChange={setBlockOpen}
        onConfirm={async () => {
          try {
            await blockMut.mutateAsync({ userId: p.userId });
            toast.success('Blocked');
            setBlockOpen(false);
            router.back();
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) {
              toast.error('Blocking is not available on this server yet.');
              return;
            }
            toast.error(friendlyMessageForError(e));
          }
        }}
      />
    </div>
  );
}
