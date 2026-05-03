'use client';

import type { MessageDto, OptimisticMessageDto } from '@/lib/messaging/types';
import { formatClock } from '@/lib/messaging/time';
import { cn } from '@/lib/utils/cn';
import { Loader2, AlertCircle } from 'lucide-react';

export type MessageBubbleProps = {
  message: MessageDto | OptimisticMessageDto;
  isOwn: boolean;
  showMeta: boolean;
};

export function MessageBubble({ message, isOwn, showMeta }: MessageBubbleProps) {
  const optimistic = 'optimisticState' in message ? message.optimisticState : undefined;

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'relative w-fit max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-snug',
          isOwn
            ? 'bg-teal text-cream dark:bg-dark-teal dark:text-dark-bg'
            : 'border border-border bg-surface text-ink-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary',
        )}
      >
        {optimistic === 'sending' ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-teal/25 dark:bg-dark-teal/25">
            <Loader2 className="h-4 w-4 animate-spin text-cream dark:text-dark-bg" aria-hidden />
          </span>
        ) : null}
        {optimistic === 'failed' ? (
          <span className="mr-1 inline-flex align-middle text-terracotta dark:text-dark-terracotta" aria-hidden>
            <AlertCircle className="h-4 w-4" />
          </span>
        ) : null}
        <span className="whitespace-pre-wrap break-words">{message.body}</span>
      </div>
      {showMeta ? (
        <span className="px-1 font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">{formatClock(message.createdAt)}</span>
      ) : null}
    </div>
  );
}
