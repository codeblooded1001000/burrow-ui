'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export type BlockConfirmModalProps = {
  user: { id: string; fullName: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function BlockConfirmModal({ user, open, onOpenChange, onConfirm }: BlockConfirmModalProps) {
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) setConfirmed(false);
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Block ${user.fullName}?`}
      description="They won't be able to message you or see your profile. You can unblock them anytime in Settings."
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 dark:border-dark-border">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-teal focus:ring-teal dark:border-dark-border dark:focus:ring-dark-teal"
          aria-label="I understand they will not be able to message me or see my profile"
        />
        <span className="font-sans text-sm leading-snug text-ink-primary dark:text-dark-ink-primary">
          I understand they won&apos;t be able to message me or see my profile.
        </span>
      </label>
      <div className="mt-4 flex flex-col gap-2.5">
        <Button
          type="button"
          variant="primary"
          loading={pending}
          disabled={!confirmed}
          className="bg-terracotta text-cream hover:bg-terracotta/90 disabled:opacity-50 dark:bg-dark-terracotta dark:text-dark-bg dark:hover:bg-dark-terracotta/90"
          onClick={async () => {
              setPending(true);
              try {
                await Promise.resolve(onConfirm());
              } finally {
                setPending(false);
              }
            }}
          >
            Block
          </Button>
        <Button type="button" variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
