'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRequestNumberShareMutation } from '@/lib/hooks/messaging';

type NumberShareRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  otherFullName: string;
};

export function NumberShareRequestModal({ open, onOpenChange, conversationId, otherFullName }: NumberShareRequestModalProps) {
  const request = useRequestNumberShareMutation();

  const send = async () => {
    await request.mutateAsync(conversationId);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Share your numbers?"
      description={`Both you and ${otherFullName} will see each other's phone numbers. You can still chat in Burrow.`}
      footer={
        <>
          <Button type="button" variant="primary" loading={request.isPending} onClick={() => void send()}>
            Send request
          </Button>
          <Button type="button" variant="secondary" disabled={request.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    />
  );
}
