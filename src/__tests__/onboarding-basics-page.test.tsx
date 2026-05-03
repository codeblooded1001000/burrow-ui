import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import OnboardingBasicsPage from '@/app/(app)/onboarding/basics/page';
import { useOnboardingStore } from '@/stores/onboarding-store';

describe('OnboardingBasicsPage', () => {
  beforeEach(() => {
    push.mockReset();
    useOnboardingStore.getState().reset();
  });

  it('renders without errors', () => {
    render(<OnboardingBasicsPage />);
    expect(screen.getByRole('heading', { name: /A few quick basics/i })).toBeVisible();
  });

  it('disables submit until form is valid', async () => {
    render(<OnboardingBasicsPage />);
    const submit = screen.getByRole('button', { name: /Continue/i });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Full name/i), 'Priya Sharma');
    expect(submit).not.toBeDisabled();
  });

  it('navigates to role with basics in store', async () => {
    const user = userEvent.setup();
    render(<OnboardingBasicsPage />);
    await user.type(screen.getByLabelText(/Full name/i), 'Priya Sharma');
    await user.clear(screen.getByLabelText(/Age/i));
    await user.type(screen.getByLabelText(/Age/i), '28');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    expect(push).toHaveBeenCalledWith('/onboarding/role');
    expect(useOnboardingStore.getState().basics).toEqual({
      fullName: 'Priya Sharma',
      age: 28,
      gender: 'WOMAN',
    });
  });
});
