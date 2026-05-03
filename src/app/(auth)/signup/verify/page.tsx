'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { OtpInput } from '@/components/ui/OtpInput';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForCode, friendlyMessageForError } from '@/lib/api/error-messages';
import { DEMO_STATIC_OTP, isDemoBypassSignupEmail } from '@/lib/auth/demo-bypass';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { VerifyOtpSchema, type VerifyOtpInput } from '@/lib/schemas/auth.schemas';
import { formatCountdown, secondsUntilIso } from '@/lib/utils/resend';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function SignupVerifyPage() {
  const router = useRouter();
  const email = useOnboardingStore((s) => s.email);
  const otpResendAvailableAt = useOnboardingStore((s) => s.otpResendAvailableAt);
  const setSignupToken = useOnboardingStore((s) => s.setSignupToken);
  const setOtpResendAvailableAt = useOnboardingStore((s) => s.setOtpResendAvailableAt);
  const demoSignupOtp = useOnboardingStore((s) => s.demoSignupOtp);
  const setDemoSignupOtp = useOnboardingStore((s) => s.setDemoSignupOtp);
  const advanceStep = useOnboardingStore((s) => s.advanceStep);

  const verifyOtp = useVerifyOtpMutation();
  const requestOtp = useRequestOtpMutation();

  const [tick, setTick] = useState(0);

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(VerifyOtpSchema),
    mode: 'onChange',
    defaultValues: { email: email ?? '', otp: '' },
  });

  useEffect(() => {
    if (!email) {
      router.replace('/signup');
    }
  }, [email, router]);

  useEffect(() => {
    if (email) {
      form.setValue('email', email);
    }
  }, [email, form]);

  useEffect(() => {
    if (email && demoSignupOtp && demoSignupOtp.length === 6) {
      form.setValue('otp', demoSignupOtp, { shouldValidate: true });
    }
  }, [demoSignupOtp, email, form]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const submitOtp = useCallback(
    async (otp: string) => {
      if (!email || otp.length !== 6) return;
      form.setValue('otp', otp, { shouldValidate: true });
      try {
        const res = await verifyOtp.mutateAsync({ email, otp });
        setDemoSignupOtp(null);
        setSignupToken(res.signupToken, res.expiresAt);
        advanceStep('pin');
        router.push('/signup/pin');
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.code === 'INVALID_OTP') {
            toast.error(friendlyMessageForCode('INVALID_OTP'));
            return;
          }
          if (e.code === 'OTP_EXPIRED') {
            toast.error(friendlyMessageForCode('OTP_EXPIRED'));
            return;
          }
          if (e.code === 'TOO_MANY_ATTEMPTS') {
            toast.error(friendlyMessageForCode('TOO_MANY_ATTEMPTS'));
            router.replace('/signup');
            return;
          }
        }
        toast.error(friendlyMessageForError(e));
      }
    },
    [advanceStep, email, form, router, setDemoSignupOtp, setSignupToken, verifyOtp],
  );

  const onResend = async () => {
    if (!email || isDemoBypassSignupEmail(email)) return;
    try {
      const res = await requestOtp.mutateAsync({ email });
      setOtpResendAvailableAt(res.resendAvailableAt);
      toast.success('A new code is on its way.');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'RATE_LIMIT') {
        toast.error(friendlyMessageForCode('RATE_LIMIT'));
        return;
      }
      toast.error(friendlyMessageForError(e));
    }
  };

  if (!email) {
    return null;
  }

  const waitSec = otpResendAvailableAt ? secondsUntilIso(otpResendAvailableAt) : 0;
  void tick;

  const demoVerify = isDemoBypassSignupEmail(email);

  return (
    <PhoneShell progress={16} back onBack={() => router.push('/signup')}>
      <input type="hidden" {...form.register('email')} />
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>{demoVerify ? 'Demo verification' : 'Check your inbox'}</Heading>
        <Subhead>
          {demoVerify ? (
            <>
              No email was sent. Use code <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{DEMO_STATIC_OTP}</span> for{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{email}</span>
              — it is filled in automatically.
            </>
          ) : (
            <>
              We sent a 6-digit code to{' '}
              <span className="font-medium text-ink-primary dark:text-dark-ink-primary">{email}</span>
            </>
          )}
        </Subhead>
      </div>
      <div className="mt-8 flex flex-col gap-5">
        <Controller
          name="otp"
          control={form.control}
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              disabled={verifyOtp.isPending}
              onComplete={(code) => {
                void submitOtp(code);
              }}
            />
          )}
        />
        <div className="flex flex-col items-center gap-2">
          {demoVerify ? (
            <span className="font-sans text-sm text-ink-tertiary dark:text-dark-ink-tertiary">Demo — resend disabled</span>
          ) : waitSec > 0 ? (
            <span className="font-sans text-sm text-ink-tertiary dark:text-dark-ink-tertiary">
              Resend in {formatCountdown(waitSec)}
            </span>
          ) : (
            <Button type="button" variant="tertiary" disabled={requestOtp.isPending} onClick={() => void onResend()}>
              Resend code
            </Button>
          )}
          <Button type="button" variant="tertiary" as={Link} href="/signup">
            Wrong email? Change it
          </Button>
        </div>
      </div>
    </PhoneShell>
  );
}
