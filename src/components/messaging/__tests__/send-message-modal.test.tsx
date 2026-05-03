import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SendMessageModal } from '@/components/messaging/SendMessageModal';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('SendMessageModal', () => {
  it('uses send-request copy in the title', () => {
    renderWithClient(
      <SendMessageModal
        open
        onOpenChange={() => undefined}
        recipientUserId="u1"
        recipientName="Priya"
      />,
    );
    expect(screen.getByText(/Send a request to Priya/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send request' })).toBeInTheDocument();
  });
});
