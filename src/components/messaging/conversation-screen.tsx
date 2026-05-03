'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, ChevronDown, MoreVertical } from 'lucide-react';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import {
  useAcceptRequestMutation,
  useConversationQuery,
  useMarkReadMutation,
  useMessagesQuery,
  useRejectRequestMutation,
  useRespondNumberShareMutation,
  useSendMessageMutation,
} from '@/lib/hooks/messaging';
import type { MessageDto, OptimisticMessageDto } from '@/lib/messaging/types';
import { dayLabelForMessage, formatClock, minutesBetween } from '@/lib/messaging/time';
import { formatPhoneDisplay, toTelHref } from '@/lib/messaging/format-phone';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MessageBubble } from '@/components/messaging/message-bubble';
import { NumberShareRequestModal } from '@/components/messaging/number-share-request-modal';
import { NumberShareConfirmModal } from '@/components/messaging/number-share-confirm-modal';
import { useMessagingUiStore } from '@/stores/messaging-ui-store';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';
import { RejectRequestConfirmModal } from '@/components/messaging/RejectRequestConfirmModal';
import { Button } from '@/components/ui/Button';
import { BlockConfirmModal } from '@/components/safety/BlockConfirmModal';
import { useBlockMutation } from '@/lib/hooks/use-safety';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { ApiError } from '@/lib/api/client';

const MAX_LEN = 2000;

type ConversationScreenProps = {
  conversationId: string;
};

function bubbleKey(m: MessageDto | OptimisticMessageDto): string {
  return m.id;
}

export function ConversationScreen({ conversationId }: ConversationScreenProps) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const convQ = useConversationQuery(conversationId);
  const messagesQ = useMessagesQuery(conversationId);
  const send = useSendMessageMutation();
  const markRead = useMarkReadMutation();
  const respondShare = useRespondNumberShareMutation();
  const acceptReq = useAcceptRequestMutation();
  const rejectReq = useRejectRequestMutation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const blockMut = useBlockMutation();
  const [requestOpen, setRequestOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [body, setBody] = useState('');
  const [atBottom, setAtBottom] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [replyMode, setReplyMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true);
  const prevLenRef = useRef(0);
  const bottomSinceRef = useRef<number | null>(null);

  const setActiveThreadId = useMessagingUiStore((s) => s.setActiveThreadId);
  const openConfirmFromStore = useMessagingUiStore((s) => s.openNumberShareConfirmForConversationId);
  const setOpenConfirmFromStore = useMessagingUiStore((s) => s.setOpenNumberShareConfirmForConversationId);

  useEffect(() => {
    setActiveThreadId(conversationId);
    return () => setActiveThreadId(null);
  }, [conversationId, setActiveThreadId]);

  useEffect(() => {
    setReplyMode(false);
    setRejectOpen(false);
  }, [conversationId]);

  useEffect(() => {
    if (convQ.data?.status === 'ACTIVE') setReplyMode(false);
  }, [convQ.data?.status]);

  useEffect(() => {
    if (openConfirmFromStore === conversationId) {
      setConfirmOpen(true);
      setOpenConfirmFromStore(null);
    }
  }, [conversationId, openConfirmFromStore, setOpenConfirmFromStore]);

  const { ref: topSentinelRef, inView: topInView } = useInView({ threshold: 0 });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = messagesQ;

  useEffect(() => {
    if (topInView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [topInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flatMessages = useMemo(() => {
    const pages = messagesQ.data?.pages ?? [];
    const all = pages.flatMap((p) => p.items);
    const byId = new Map<string, (typeof all)[number]>();
    for (const m of all) {
      byId.set(m.id, m);
    }
    return Array.from(byId.values()).sort((a, b) => {
      const t = a.createdAt.localeCompare(b.createdAt);
      if (t !== 0) return t;
      return a.id.localeCompare(b.id);
    });
  }, [messagesQ.data]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useLayoutEffect(() => {
    if (messagesQ.isPending) return;
    scrollToBottom('auto');
  }, [conversationId, messagesQ.isPending, scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 96;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      const next = dist < threshold;
      atBottomRef.current = next;
      setAtBottom(next);
      if (next) {
        if (bottomSinceRef.current === null) bottomSinceRef.current = Date.now();
        setShowNew(false);
      } else {
        bottomSinceRef.current = null;
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [flatMessages.length]);

  useEffect(() => {
    if (flatMessages.length > prevLenRef.current) {
      const last = flatMessages[flatMessages.length - 1];
      const grew = flatMessages.length > prevLenRef.current;
      if (grew && last && user && last.senderId === user.id) {
        scrollToBottom('smooth');
      } else if (grew && !atBottomRef.current) {
        setShowNew(true);
      }
    }
    prevLenRef.current = flatMessages.length;
  }, [flatMessages, scrollToBottom, user]);

  useEffect(() => {
    if (!atBottom) return;
    const t = window.setTimeout(() => {
      if (!atBottomRef.current) return;
      if (bottomSinceRef.current === null || Date.now() - bottomSinceRef.current < 1000) return;
      markRead.mutate({ conversationId });
    }, 1100);
    return () => window.clearTimeout(t);
  }, [atBottom, conversationId, flatMessages.length, markRead]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuOpen) return;
      const t = e.target as Node;
      const root = document.getElementById('conv-kebab-root');
      if (root && !root.contains(t)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const meId = user?.id ?? '';

  const lastReadOwnId = useMemo(() => {
    if (!meId) return null;
    for (let i = flatMessages.length - 1; i >= 0; i -= 1) {
      const m = flatMessages[i];
      if (m.senderId === meId && m.readAt) return m.id;
    }
    return null;
  }, [flatMessages, meId]);

  const conv = convQ.data;
  const other = conv?.otherParticipant;

  const trimmed = body.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LEN && !send.isPending;

  const submit = () => {
    if (!canSend) return;
    const text = trimmed;
    setBody('');
    send.mutate({ conversationId, body: text });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  const copyPhone = async (raw: string) => {
    try {
      await navigator.clipboard.writeText(raw);
      toast.success('Copied');
    } catch {
      toast.error('Could not copy.');
    }
  };

  const handleNumberPillClick = (raw: string) => {
    const isCoarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      window.location.href = toTelHref(raw);
      return;
    }
    void copyPhone(raw);
  };

  if (convQ.isError) {
    return (
      <div className="px-4 py-10 text-center font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
        Could not load this conversation.
        <button type="button" className="mt-3 block w-full text-teal underline dark:text-dark-teal" onClick={() => void convQ.refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (convQ.isPending || !conv || !other) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6">
        <Skeleton width="60%" height={20} radius={8} />
        <Skeleton width="100%" height={48} radius={12} />
        <Skeleton width="100%" height={48} radius={12} />
        <Skeleton width="72%" height={48} radius={12} />
      </div>
    );
  }

  const pending = conv.pendingNumberShareRequest;
  const isRequester = pending && pending.requestedByUserId === meId;
  const isRecipient = pending && pending.requestedByUserId !== meId && pending.status === 'PENDING';

  const chatActive = conv.status === 'ACTIVE';
  const pendingGate = conv.status === 'PENDING';
  const isReceiverOfRequest = pendingGate && conv.initiatedByUserId !== meId;
  const isInitiatorPending = pendingGate && conv.initiatedByUserId === meId;
  const showReceiverActions = isReceiverOfRequest && !replyMode;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-cream/95 px-2 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
        <button
          type="button"
          className="rounded-full p-2 text-ink-primary hover:bg-teal-tint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25 dark:focus-visible:ring-dark-teal/35"
          aria-label="Back"
          onClick={() => router.push('/inbox')}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1">
          <span className="truncate font-sans text-base font-medium text-ink-primary dark:text-dark-ink-primary">{other.fullName}</span>
          {other.companyVerified ? <VerifiedBadge size={18} companyName={other.companyName} className="shrink-0" /> : null}
        </div>
        <div className="relative shrink-0" id="conv-kebab-root">
          <button
            type="button"
            className="rounded-full p-2 text-ink-primary hover:bg-teal-tint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25 dark:focus-visible:ring-dark-teal/35"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Conversation menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg dark:border-dark-border dark:bg-dark-surface"
            >
              <Link
                role="menuitem"
                href={`/profiles/${other.id}`}
                className="block px-3 py-2 font-sans text-sm text-ink-primary hover:bg-teal-tint/40 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25"
                onClick={() => setMenuOpen(false)}
              >
                View profile
              </Link>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left font-sans text-sm text-ink-primary hover:bg-teal-tint/40 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25"
                onClick={() => {
                  setMenuOpen(false);
                  setBlockOpen(true);
                }}
              >
                Block
              </button>
              <Link
                role="menuitem"
                href={`/report/${other.id}?conversationId=${encodeURIComponent(conversationId)}`}
                className="block px-3 py-2 font-sans text-sm text-ink-primary hover:bg-teal-tint/40 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25"
                onClick={() => setMenuOpen(false)}
              >
                Report
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {isReceiverOfRequest ? (
        <div className="mx-3 mt-2 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-secondary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-secondary">
          <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{other.fullName}</span> wants to start a
          conversation. Reply, accept, or reject.
        </div>
      ) : null}
      {isInitiatorPending ? (
        <div className="mx-3 mt-2 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-secondary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-secondary">
          Awaiting {other.fullName}&apos;s response. They&apos;ll see your intro message and can accept, reply, or reject.
        </div>
      ) : null}

      {!conv.numbersShared && !bannerDismissed ? (
        <div className="mx-3 mt-2 flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-xs text-ink-secondary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-secondary">
          <p className="min-w-0 flex-1 leading-snug">Numbers will only be shared after you both agree.</p>
          <button type="button" className="shrink-0 text-teal dark:text-dark-teal" onClick={() => setBannerDismissed(true)}>
            Dismiss
          </button>
        </div>
      ) : null}

      {chatActive ? (
        <div className="mx-3 mt-2 flex flex-col gap-2">
          {conv.numbersShared && conv.otherPhoneNumber ? (
            <button
              type="button"
              onClick={() => handleNumberPillClick(conv.otherPhoneNumber ?? '')}
              className="rounded-full border border-border bg-surface px-4 py-2 text-left font-sans text-sm text-ink-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            >
              Numbers shared · {formatPhoneDisplay(conv.otherPhoneNumber)}
            </button>
          ) : null}

          {!conv.numbersShared && !pending ? (
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="rounded-full border border-teal/40 bg-teal-tint px-4 py-2 text-center font-sans text-sm font-medium text-teal dark:border-dark-teal/40 dark:bg-dark-teal-tint dark:text-dark-teal"
            >
              Request to share numbers
            </button>
          ) : null}

          {!conv.numbersShared && pending && isRequester ? (
            <div className="rounded-full border border-border bg-surface px-4 py-2 text-center font-sans text-sm text-ink-secondary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-secondary">
              Number share requested · Waiting
            </div>
          ) : null}

          {!conv.numbersShared && isRecipient ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="flex-1 rounded-full bg-teal py-2.5 font-sans text-sm font-medium text-cream dark:bg-dark-teal dark:text-dark-bg"
              >
                Share numbers
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!pending) return;
                  void respondShare.mutateAsync({
                    conversationId,
                    body: { requestId: pending.id, accept: false },
                  });
                }}
                className="flex-1 rounded-full border border-border py-2.5 font-sans text-sm font-medium text-ink-primary dark:border-dark-border dark:text-dark-ink-primary"
              >
                Decline
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-2">
        <div ref={topSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
        {messagesQ.isPending ? (
          <div className="flex flex-col gap-3 py-4">
            <Skeleton width="70%" height={44} radius={16} className="self-end" />
            <Skeleton width="55%" height={44} radius={16} className="self-start" />
            <Skeleton width="62%" height={44} radius={16} className="self-end" />
          </div>
        ) : null}

        {!messagesQ.isPending
          ? flatMessages.map((m, idx) => {
              const prev = flatMessages[idx - 1];
              const day = dayLabelForMessage(m.createdAt);
              const prevDay = prev ? dayLabelForMessage(prev.createdAt) : null;
              const showDay = !prev || day !== prevDay;
              const showMeta = !prev || minutesBetween(prev.createdAt, m.createdAt) > 1;
              const isOwn = m.senderId === meId;
              return (
                <div key={bubbleKey(m)} className="mb-3">
                  {showDay ? (
                    <div className="mb-3 flex justify-center">
                      <span className="rounded-full bg-surface px-3 py-1 font-sans text-[11px] text-ink-tertiary dark:bg-dark-surface dark:text-dark-ink-tertiary">
                        {day}
                      </span>
                    </div>
                  ) : null}
                  <div className={cn('flex w-full min-w-0 flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                    <MessageBubble message={m} isOwn={isOwn} showMeta={showMeta} />
                    {isOwn && 'optimisticState' in m && m.optimisticState === 'failed' ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-terracotta dark:text-dark-terracotta"
                        onClick={() => send.mutate({ conversationId, body: m.body, replaceTempId: m.id })}
                      >
                        Tap to retry
                      </button>
                    ) : null}
                    {isOwn && m.readAt && m.id === lastReadOwnId ? (
                      <p className="text-right font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
                        ✓ Read {formatClock(m.readAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          : null}
      </div>

      {showNew ? (
        <button
          type="button"
          className="fixed bottom-28 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 font-sans text-xs font-medium text-ink-primary shadow-md dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
          onClick={() => {
            scrollToBottom('smooth');
            setShowNew(false);
          }}
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          New message
        </button>
      ) : null}

      {chatActive || (isReceiverOfRequest && replyMode) ? (
        <div className="fixed bottom-16 left-0 right-0 z-20 mx-auto w-full max-w-[390px] border-t border-border bg-cream/95 px-3 py-2 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
          <div className="flex items-end gap-2">
            <textarea
              ref={composerRef}
              rows={1}
              maxLength={MAX_LEN}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message"
              className="max-h-[7.5rem] min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            />
            <button
              type="button"
              disabled={!canSend}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-cream disabled:opacity-40 dark:bg-dark-teal dark:text-dark-bg"
              aria-label="Send"
              onClick={() => submit()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {body.length > 1700 ? (
            <p className="mt-1 text-right font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
              {body.length}/{MAX_LEN}
            </p>
          ) : null}
        </div>
      ) : null}

      {showReceiverActions ? (
        <div className="fixed bottom-16 left-0 right-0 z-20 mx-auto w-full max-w-[390px] border-t border-border bg-cream/95 px-3 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              loading={acceptReq.isPending}
              onClick={() =>
                void acceptReq.mutateAsync(conversationId).then(() => {
                  toast.success('Request accepted');
                })
              }
            >
              Accept
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 border-terracotta text-terracotta hover:bg-terracotta/10 dark:border-dark-terracotta dark:text-dark-terracotta"
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setReplyMode(true);
                  window.setTimeout(() => composerRef.current?.focus(), 0);
                }}
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isInitiatorPending ? (
        <div
          className="fixed bottom-16 left-0 right-0 z-20 mx-auto w-full max-w-[390px] border-t border-border bg-cream/95 px-3 py-4 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95"
          title={`You can send another message after ${other.fullName} accepts your request.`}
        >
          <p className="text-center font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Waiting for a reply before you can send another message.
          </p>
        </div>
      ) : null}

      <RejectRequestConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        otherName={other.fullName}
        loading={rejectReq.isPending}
        onConfirm={async (reason) => {
          try {
            await rejectReq.mutateAsync({ conversationId, reason });
            toast('Request rejected');
            setRejectOpen(false);
            router.replace('/inbox');
          } catch {
            toast.error('Could not reject request.');
          }
        }}
      />

      <NumberShareRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        conversationId={conversationId}
        otherFullName={other.fullName}
      />

      {pending && isRecipient ? (
        <NumberShareConfirmModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          conversationId={conversationId}
          requestId={pending.id}
          requesterFullName={conv.otherParticipant.fullName}
        />
      ) : null}

      <BlockConfirmModal
        user={{ id: other.id, fullName: other.fullName }}
        open={blockOpen}
        onOpenChange={setBlockOpen}
        onConfirm={async () => {
          try {
            await blockMut.mutateAsync({ userId: other.id });
            toast.success('Blocked');
            setBlockOpen(false);
            router.push('/inbox');
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) {
              toast.error('Could not block this user.');
              return;
            }
            toast.error(friendlyMessageForError(e));
          }
        }}
      />
    </div>
  );
}
