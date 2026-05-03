import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/hooks/use-constants', () => ({
  useGetConstantsQuery: () => ({
    data: {
      localities: ['Cyber City'],
      vibes: [],
      schedule: [],
      interests: [],
      personality: [],
      professions: ['Software engineer'],
      amenities: ['Wi-Fi'],
    },
    isPending: false,
  }),
}));

import ListingBasicsPage from '@/app/(app)/listing/new/basics/page';
import { useListingDraftStore } from '@/stores/listing-draft-store';

function tomorrowYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('ListingBasicsPage', () => {
  beforeEach(() => {
    push.mockReset();
    useListingDraftStore.getState().reset();
  });

  it('disables Continue until the form is valid', async () => {
    render(<ListingBasicsPage />);
    const submit = await screen.findByRole('button', { name: /^Continue$/i });
    expect(submit).toBeDisabled();
  });

  it('enables Continue after required fields pass validation', async () => {
    const user = userEvent.setup();
    render(<ListingBasicsPage />);
    await user.selectOptions(screen.getByLabelText(/^Locality$/i), 'Cyber City');
    await user.clear(screen.getByLabelText(/^Total rent/i));
    await user.type(screen.getByLabelText(/^Total rent/i), '45000');
    await user.clear(screen.getByLabelText(/^Your share/i));
    await user.type(screen.getByLabelText(/^Your share/i), '22000');
    const dateInput = screen.getByLabelText(/^Available from$/i);
    await user.clear(dateInput);
    await user.type(dateInput, tomorrowYmd());

    const submit = screen.getByRole('button', { name: /^Continue$/i });
    expect(submit).not.toBeDisabled();
  });
});
