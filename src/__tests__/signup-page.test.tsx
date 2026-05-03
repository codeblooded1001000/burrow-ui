import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mutateAsync, push } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/lib/hooks/auth/use-auth-mutations', () => ({
  useRequestOtpMutation: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import SignupPage from '@/app/(auth)/signup/page';

describe('SignupPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    push.mockReset();
    mutateAsync.mockResolvedValue({
      ok: true,
      expiresAt: new Date().toISOString(),
      resendAvailableAt: new Date().toISOString(),
    });
  });

  it('renders without errors', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: /Find your flatmate/i })).toBeVisible();
  });

  it('disables submit until email is valid', async () => {
    render(<SignupPage />);
    const submit = screen.getByRole('button', { name: /Send verification code/i });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Work email/i), 'not-an-email');
    expect(submit).toBeDisabled();
    await userEvent.clear(screen.getByLabelText(/Work email/i));
    await userEvent.type(screen.getByLabelText(/Work email/i), 'you@company.com');
    expect(submit).not.toBeDisabled();
  });

  it('submits request-otp with email', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Work email/i), 'you@company.com');
    await user.click(screen.getByRole('button', { name: /Send verification code/i }));
    expect(mutateAsync).toHaveBeenCalledWith({ email: 'you@company.com' });
  });

  it('demo Alt Mobility email skips send and uses Continue', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    await user.type(screen.getByLabelText(/Work email/i), 'prince@alt-mobility.com');
    expect(screen.getByRole('button', { name: /^Continue$/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/signup/verify');
  });
});
