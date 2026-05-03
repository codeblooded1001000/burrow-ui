'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRespondNumberShareMutation } from '@/lib/hooks/messaging';

type NumberShareConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  requestId: string;
  requesterFullName: string;
};

export function NumberShareConfirmModal({
  open,
  onOpenChange,
  conversationId,
  requestId,
  requesterFullName,
}: NumberShareConfirmModalProps) {
  const respond = useRespondNumberShareMutation();

  const accept = async () => {
    await respond.mutateAsync({ conversationId, body: { requestId, accept: true } });
    onOpenChange(false);
  };

  const decline = async () => {
    await respond.mutateAsync({ conversationId, body: { requestId, accept: false } });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`${requesterFullName} wants to share numbers`}
      description="If you accept, both numbers will be visible in this conversation."
      footer={
        <>
          <Button type="button" variant="primary" loading={respond.isPending} onClick={() => void accept()}>
            Share
          </Button>
          <Button type="button" variant="secondary" className="text-terracotta dark:text-dark-terracotta" disabled={respond.isPending} onClick={() => void decline()}>
            Not now
          </Button>
        </>
      }
    />
  );
}
