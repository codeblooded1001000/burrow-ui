import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mutateAsync = vi.fn().mockResolvedValue({ ok: true as const });

vi.mock('@/lib/hooks/use-safety', () => ({
  useDeleteAccountMutation: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import DeleteAccountPage from '@/app/(app)/settings/delete-account/page';

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('DeleteAccountPage', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
  });

  it('requires a valid 6-digit PIN before submit is enabled', async () => {
    const user = userEvent.setup();
    wrap(<DeleteAccountPage />);

    const submit = screen.getByRole('button', { name: /Delete permanently/i });
    expect(submit).toBeDisabled();

    const cells = screen.getAllByLabelText(/PIN digit/i);
    const pin = '847291';
    for (let i = 0; i < 6; i += 1) {
      await user.type(cells[i] ?? cells[0], pin[i] ?? '');
    }

    expect(submit).not.toBeDisabled();
    await user.click(submit);
    expect(mutateAsync).toHaveBeenCalledWith({ pin: '847291' });
  });
});
