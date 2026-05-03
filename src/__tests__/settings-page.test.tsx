import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const prefsMutate = vi.fn().mockResolvedValue({ ok: true as const });

vi.mock('@/lib/hooks/use-safety', () => ({
  useUpdateNotificationPrefsMutation: () => ({ mutateAsync: prefsMutate, isPending: false }),
  useExportDataMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ blob: new Blob(['{}'], { type: 'application/json' }), filename: 'x.json' }),
    isPending: false,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import SettingsPage from '@/app/(app)/settings/page';

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SettingsPage', () => {
  beforeEach(() => {
    prefsMutate.mockClear();
  });

  it('calls notification prefs stub mutation when a toggle changes', async () => {
    const user = userEvent.setup();
    wrap(<SettingsPage />);

    const switches = screen.getAllByRole('switch');
    const newMessages = switches[0];
    expect(newMessages).toHaveAttribute('aria-checked', 'true');

    await user.click(newMessages!);
    expect(prefsMutate).toHaveBeenCalledWith({ newMessages: false });
  });
});
