'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCreateConversationMutation } from '@/lib/hooks/use-create-conversation';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { toast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { parseCreateConversationResponse } from '@/lib/messaging/query-keys';

type SendMessageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientUserId: string;
  recipientName: string;
};

export function SendMessageModal({ open, onOpenChange, recipientUserId, recipientName }: SendMessageModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const createConv = useCreateConversationMutation();

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Write a short first message.');
      return;
    }
    try {
      const res = await createConv.mutateAsync({ recipientUserId, initialMessage: trimmed });
      const parsed = parseCreateConversationResponse(res);
      if (!parsed?.conversationId) {
        toast.error('Unexpected response from server.');
        return;
      }
      setMessage('');
      onOpenChange(false);
      toast.success(`Request sent to ${recipientName}. We'll notify you when they respond.`);
      router.push('/inbox/sent');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        if (e.code === 'CANNOT_SEND_REQUEST') {
          toast.error(friendlyMessageForError(e));
          return;
        }
        toast.error('Messaging is not available yet — try again after the next API update.');
        return;
      }
      toast.error(friendlyMessageForError(e));
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Send a request to ${recipientName}`}
      description="Your first message reaches them as a request. They can accept, reject, or reply. Make it count."
      footer={
        <>
          <Button type="button" variant="primary" loading={createConv.isPending} onClick={() => void send()}>
            Send request
          </Button>
          <Button type="button" variant="tertiary" disabled={createConv.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <label className="block font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary" htmlFor="first-msg">
        Your first message
      </label>
      <textarea
        id="first-msg"
        maxLength={1000}
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
      />
      <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">Once accepted, you can chat freely.</p>
      <p className="mt-0.5 text-right font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{message.length}/1000</p>
    </Modal>
  );
}
