'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Renders between title and close (e.g. Reset). */
  headerRight?: ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function BottomSheet({ open, onOpenChange, title, headerRight, children, footer, className }: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-[390px] flex-col rounded-t-[20px] bg-surface focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-4 dark:bg-dark-surface',
            className,
          )}
        >
          <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-border dark:bg-dark-border" />
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3 dark:border-dark-border">
            <Dialog.Title className="min-w-0 flex-1 font-serif text-lg font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
              {title}
            </Dialog.Title>
            {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
            <Dialog.Close
              type="button"
              className="rounded-sm p-1 text-ink-tertiary hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-tertiary dark:hover:text-dark-ink-primary"
              aria-label="Close"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">{children}</div>
          {footer ? <div className="shrink-0 border-t border-border px-5 py-4 dark:border-dark-border">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
