'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, onOpenChange, title, description, children, footer, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[320px] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] bg-surface p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:bg-dark-surface',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-serif text-lg font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="rounded-sm p-1 text-ink-tertiary hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-tertiary dark:hover:text-dark-ink-primary dark:focus-visible:ring-dark-teal/35"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children ? <div className="mt-4 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{children}</div> : null}
          {footer ? <div className="mt-4 flex flex-col gap-2.5">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
