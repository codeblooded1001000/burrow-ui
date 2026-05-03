import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockConfirmModal } from '@/components/safety/BlockConfirmModal';

describe('BlockConfirmModal', () => {
  it('keeps Block disabled until the confirmation checkbox is checked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <BlockConfirmModal user={{ id: 'u1', fullName: 'Alex' }} open onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );

    const blockBtn = screen.getByRole('button', { name: 'Block' });
    expect(blockBtn).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));

    expect(blockBtn).not.toBeDisabled();
    await user.click(blockBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
