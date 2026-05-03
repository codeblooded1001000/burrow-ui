import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import ListingIntroPage from '@/app/(app)/listing/new/intro/page';
import { useListingDraftStore } from '@/stores/listing-draft-store';

describe('ListingIntroPage', () => {
  beforeEach(() => {
    push.mockReset();
    useListingDraftStore.getState().reset();
  });

  it('renders headline and routes to basics on Get started', async () => {
    const user = userEvent.setup();
    render(<ListingIntroPage />);
    expect(screen.getByRole('heading', { name: /Tell us about your flat/i })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Get started/i }));
    expect(push).toHaveBeenCalledWith('/listing/new/basics');
  });
});
