'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

type RejectRequestConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherName: string;
  onConfirm: (reason: string | undefined) => void | Promise<void>;
  loading?: boolean;
};

export function RejectRequestConfirmModal({
  open,
  onOpenChange,
  otherName,
  onConfirm,
  loading = false,
}: RejectRequestConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setReason('');
          setConfirmed(false);
        }
        onOpenChange(next);
      }}
      title={`Reject ${otherName}'s request?`}
      description="They won't be able to message you again. You can still reach out to them yourself if you change your mind."
      footer={
        <>
          <Button
            type="button"
            variant="primary"
            className="bg-terracotta hover:bg-terracotta/90 dark:bg-dark-terracotta dark:hover:bg-dark-terracotta/90"
            loading={loading}
            disabled={loading || !confirmed}
            onClick={() => void onConfirm(reason.trim() ? reason.trim().slice(0, 200) : undefined)}
          >
            Reject
          </Button>
          <Button type="button" variant="tertiary" disabled={loading} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <label className="flex cursor-pointer items-start gap-2 font-sans text-sm text-ink-primary dark:text-dark-ink-primary">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-border text-teal focus:ring-teal dark:border-dark-border"
        />
        <span>I understand they won&apos;t be able to message me again from this request.</span>
      </label>
      <label className="mt-4 block font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary" htmlFor="reject-reason">
        Reason (only visible to admins, optional)
      </label>
      <textarea
        id="reject-reason"
        maxLength={200}
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
      />
      <p className="mt-1 text-right font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{reason.length}/200</p>
    </Modal>
  );
}
