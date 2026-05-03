import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mutateAsync, push } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/lib/hooks/auth/use-auth-mutations', () => ({
  useLoginMutation: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    push.mockReset();
    mutateAsync.mockResolvedValue({ ok: true, user: { id: '1' } });
  });

  it('renders without errors', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  it('keeps submit disabled until email and PIN are valid', async () => {
    render(<LoginPage />);
    const submit = screen.getByRole('button', { name: /Sign in/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Work email/i), 'you@company.com');
    expect(submit).toBeDisabled();

    const pinCells = screen.getAllByLabelText(/PIN digit/i);
    for (let i = 0; i < 6; i += 1) {
      await userEvent.type(pinCells[i] ?? pinCells[0], String((i % 9) + 1));
    }

    expect(submit).not.toBeDisabled();
  });

  it('calls login mutation with trimmed payload', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/Work email/i), '  YOU@COMPANY.COM ');
    const pinCells = screen.getAllByLabelText(/PIN digit/i);
    const pin = '246810';
    for (let i = 0; i < 6; i += 1) {
      await user.type(pinCells[i] ?? pinCells[0], pin[i] ?? '');
    }

    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(mutateAsync).toHaveBeenCalledWith({ email: 'you@company.com', pin: '246810' });
  });
});
