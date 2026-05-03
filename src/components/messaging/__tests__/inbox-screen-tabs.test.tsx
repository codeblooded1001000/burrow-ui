import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InboxScreen } from '@/components/messaging/inbox-screen';

const mockReplace = vi.fn();
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => searchParams,
}));

vi.mock('@/lib/hooks/messaging', () => ({
  useConversationsQuery: () => ({
    data: { pages: [{ items: [], nextCursor: null, hasMore: false }] },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useSentRequestsQuery: () => ({ data: { items: [] } }),
  useReceivedRequestsCountQuery: () => ({ data: 0 }),
}));

function wrap(ui: ReactElement) {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('InboxScreen tabs', () => {
  it('switches tab via router.replace with ?tab=requests', async () => {
    const user = userEvent.setup();
    searchParams = new URLSearchParams();
    mockReplace.mockClear();
    wrap(<InboxScreen />);
    await user.click(screen.getByRole('tab', { name: /Requests/i }));
    expect(mockReplace).toHaveBeenCalledWith('/inbox?tab=requests');
  });
});
