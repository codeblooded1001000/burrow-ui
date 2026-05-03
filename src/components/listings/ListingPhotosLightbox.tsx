'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ListingPhotoCarousel } from '@/components/listings/ListingPhotoCarousel';
import { cn } from '@/lib/utils/cn';

type ListingPhotosLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: string[];
  title: string;
};

export function ListingPhotosLightbox({ open, onOpenChange, photos, title }: ListingPhotosLightboxProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/65 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[60] flex max-h-[min(92vh,880px)] w-[min(calc(100vw-2rem),420px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out dark:border-dark-border dark:bg-dark-bg',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5 dark:border-dark-border">
            <Dialog.Title className="truncate font-serif text-base font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="rounded-full p-2 text-ink-tertiary hover:bg-teal-tint/50 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-tertiary dark:hover:bg-dark-teal-tint/30 dark:hover:text-dark-ink-primary dark:focus-visible:ring-dark-teal/35"
              aria-label="Close photos"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Swipe or use dots to browse listing photos.</Dialog.Description>
          <div className="min-h-0 flex-1">
            <ListingPhotoCarousel
              photos={photos}
              slideHeightClass="h-[min(68vh,560px)] min-h-[220px] w-full"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
