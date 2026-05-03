import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { requestMut, resetMut, push } = vi.hoisted(() => ({
  requestMut: vi.fn(),
  resetMut: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/lib/hooks/auth/use-auth-mutations', () => ({
  useForgotPinMutation: () => ({ mutateAsync: requestMut, isPending: false }),
  useResetPinMutation: () => ({ mutateAsync: resetMut, isPending: false }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ForgotPinPage from '@/app/(auth)/login/forgot-pin/page';

describe('ForgotPinPage', () => {
  beforeEach(() => {
    requestMut.mockReset();
    resetMut.mockReset();
    push.mockReset();
    requestMut.mockResolvedValue({
      ok: true,
      expiresAt: new Date().toISOString(),
      resendAvailableAt: new Date().toISOString(),
    });
    resetMut.mockResolvedValue({ ok: true, user: { id: '1' } });
  });

  it('renders email step', () => {
    render(<ForgotPinPage />);
    expect(screen.getByRole('heading', { name: /Reset your PIN/i })).toBeVisible();
  });

  it('disables send until email valid and requests OTP', async () => {
    const user = userEvent.setup();
    render(<ForgotPinPage />);
    const send = screen.getByRole('button', { name: /Send code/i });
    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText(/Work email/i), 'you@company.com');
    expect(send).not.toBeDisabled();
    await user.click(send);
    expect(requestMut).toHaveBeenCalledWith({ email: 'you@company.com' });
  });

  it('submits reset with full payload on second step', async () => {
    const user = userEvent.setup();
    render(<ForgotPinPage />);
    await user.type(screen.getByLabelText(/Work email/i), 'you@company.com');
    await user.click(screen.getByRole('button', { name: /Send code/i }));

    const otpCells = screen.getAllByLabelText(/Digit \d of 6/i);
    const otp = '654321';
    for (let i = 0; i < 6; i += 1) {
      await user.type(otpCells[i] ?? otpCells[0], otp[i] ?? '');
    }

    const pinCells = screen.getAllByLabelText(/PIN digit/i);
    const newPin = '135790';
    for (let i = 0; i < 6; i += 1) {
      await user.type(pinCells[i] ?? pinCells[0], newPin[i] ?? '');
    }
    for (let i = 0; i < 6; i += 1) {
      await user.type(pinCells[i + 6] ?? pinCells[6], newPin[i] ?? '');
    }

    await user.click(screen.getByRole('button', { name: /Update PIN and sign in/i }));

    expect(resetMut).toHaveBeenCalledWith({
      email: 'you@company.com',
      otp: '654321',
      newPin: '135790',
      confirmNewPin: '135790',
    });
  });
});
