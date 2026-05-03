import { create } from 'zustand';
import type { BasicsInput } from '@/lib/schemas/auth.schemas';

export type OnboardingStep = 'email' | 'otp' | 'pin' | 'basics' | 'role' | 'done';

type OnboardingState = {
  email: string | null;
  signupToken: string | null;
  signupTokenExpiresAt: string | null;
  otpResendAvailableAt: string | null;
  /** Prefilled OTP for showcase demo emails (skips “send code” API). Cleared after verify. */
  demoSignupOtp: string | null;
  basics: BasicsInput | null;
  step: OnboardingStep;
  setEmail: (email: string) => void;
  setSignupToken: (token: string, expiresAt: string) => void;
  setOtpResendAvailableAt: (iso: string | null) => void;
  setDemoSignupOtp: (otp: string | null) => void;
  setBasics: (basics: BasicsInput) => void;
  advanceStep: (step: OnboardingStep) => void;
  reset: () => void;
};

const initial = {
  email: null as string | null,
  signupToken: null as string | null,
  signupTokenExpiresAt: null as string | null,
  otpResendAvailableAt: null as string | null,
  demoSignupOtp: null as string | null,
  basics: null as BasicsInput | null,
  step: 'email' as OnboardingStep,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setEmail: (email) => set({ email }),
  setSignupToken: (signupToken, signupTokenExpiresAt) => set({ signupToken, signupTokenExpiresAt }),
  setOtpResendAvailableAt: (otpResendAvailableAt) => set({ otpResendAvailableAt }),
  setDemoSignupOtp: (demoSignupOtp) => set({ demoSignupOtp }),
  setBasics: (basics) => set({ basics }),
  advanceStep: (step) => set({ step }),
  reset: () => set(initial),
}));
