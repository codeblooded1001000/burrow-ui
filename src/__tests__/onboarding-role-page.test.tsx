import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { roleMut, profileMut, push, fetchQuery } = vi.hoisted(() => ({
  roleMut: vi.fn(),
  profileMut: vi.fn(),
  push: vi.fn(),
  fetchQuery: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ fetchQuery }),
}));

vi.mock('@/lib/hooks/auth/use-auth-mutations', () => ({
  useUpdateRoleMutation: () => ({ mutateAsync: roleMut, isPending: false }),
  useUpdateProfileMutation: () => ({ mutateAsync: profileMut, isPending: false }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import OnboardingRolePage from '@/app/(app)/onboarding/role/page';
import { useOnboardingStore } from '@/stores/onboarding-store';

describe('OnboardingRolePage', () => {
  beforeEach(() => {
    roleMut.mockReset();
    profileMut.mockReset();
    push.mockReset();
    fetchQuery.mockReset();
    roleMut.mockResolvedValue({ ok: true, user: { id: '1' } });
    profileMut.mockResolvedValue({});
    fetchQuery.mockResolvedValue({ user: { profileCompletion: 30 } });
    useOnboardingStore.getState().reset();
    useOnboardingStore.getState().setBasics({ fullName: 'Priya Sharma', age: 28, gender: 'WOMAN' });
  });

  it('renders without errors', () => {
    render(<OnboardingRolePage />);
    expect(screen.getByRole('heading', { name: /What brings you here/i })).toBeVisible();
  });

  it('disables continue until a role card is selected', () => {
    render(<OnboardingRolePage />);
    expect(screen.getByRole('button', { name: /^Continue$/i })).toBeDisabled();
  });

  it('routes LISTER to office step after role and profile save', async () => {
    const user = userEvent.setup();
    render(<OnboardingRolePage />);
    await user.click(screen.getByRole('button', { name: /Select role: I have a flat/i }));
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(roleMut).toHaveBeenCalledWith({ role: 'LISTER' });
    expect(profileMut).toHaveBeenCalled();
    expect(fetchQuery).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/onboarding/office');
    expect(useOnboardingStore.getState().basics).toBeNull();
  });

  it('routes SEEKER with low profile completion to office step', async () => {
    fetchQuery.mockResolvedValue({ user: { profileCompletion: 30 } });
    const user = userEvent.setup();
    render(<OnboardingRolePage />);
    await user.click(screen.getByRole('button', { name: /Select role: I'm looking for a flat/i }));
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(roleMut).toHaveBeenCalledWith({ role: 'SEEKER' });
    expect(push).toHaveBeenCalledWith('/onboarding/office');
  });

  it('routes SEEKER with high profile completion to office step', async () => {
    fetchQuery.mockResolvedValue({ user: { profileCompletion: 72 } });
    const user = userEvent.setup();
    render(<OnboardingRolePage />);
    await user.click(screen.getByRole('button', { name: /Select role: I'm looking for a flat/i }));
    await user.click(screen.getByRole('button', { name: /^Continue$/i }));
    expect(push).toHaveBeenCalledWith('/onboarding/office');
  });
});
