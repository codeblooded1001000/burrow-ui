import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectRequestConfirmModal } from '@/components/messaging/RejectRequestConfirmModal';

describe('RejectRequestConfirmModal', () => {
  it('disables Reject until confirmation checkbox is checked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectRequestConfirmModal open onOpenChange={() => undefined} otherName="Rahul" onConfirm={onConfirm} />,
    );
    const rejectBtn = screen.getByRole('button', { name: 'Reject' });
    expect(rejectBtn).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    expect(rejectBtn).not.toBeDisabled();
    await user.click(rejectBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
