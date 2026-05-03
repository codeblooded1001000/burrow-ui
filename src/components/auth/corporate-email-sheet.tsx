'use client';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

type CorporateEmailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CorporateEmailSheet({ open, onOpenChange }: CorporateEmailSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Why corporate email?"
      footer={
        <Button type="button" variant="primary" onClick={() => onOpenChange(false)}>
          Got it
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pb-2 font-sans text-[15px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
        <p>
          A work email is the one credential most people cannot fake. It is issued by your employer, not self-generated.
        </p>
        <p>When you see a verified badge on Burrow, the company on that profile has been confirmed. Not self-reported.</p>
        <p>We do not store your inbox or read your emails. We send one code, you enter it, done.</p>
      </div>
    </BottomSheet>
  );
}
