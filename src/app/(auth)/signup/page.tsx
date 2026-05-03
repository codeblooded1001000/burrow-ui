'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { CorporateEmailSheet } from '@/components/auth/corporate-email-sheet';
import { Wordmark } from '@/components/brand/Wordmark';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForCode, friendlyMessageForError } from '@/lib/api/error-messages';
import { DEMO_STATIC_OTP, isDemoBypassSignupEmail } from '@/lib/auth/demo-bypass';
import { useRequestOtpMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { RequestOtpSchema, type RequestOtpInput } from '@/lib/schemas/auth.schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function SignupPage() {
  const router = useRouter();
  const setEmail = useOnboardingStore((s) => s.setEmail);
  const advanceStep = useOnboardingStore((s) => s.advanceStep);
  const setOtpResendAvailableAt = useOnboardingStore((s) => s.setOtpResendAvailableAt);
  const setDemoSignupOtp = useOnboardingStore((s) => s.setDemoSignupOtp);
  const [sheetOpen, setSheetOpen] = useState(false);
  const requestOtp = useRequestOtpMutation();

  const form = useForm<RequestOtpInput>({
    resolver: zodResolver(RequestOtpSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const emailValue = form.watch('email');
  const isDemoSignup = isDemoBypassSignupEmail(emailValue);

  const onSubmit = form.handleSubmit(async (values) => {
    setEmail(values.email);
    if (isDemoBypassSignupEmail(values.email)) {
      setDemoSignupOtp(DEMO_STATIC_OTP);
      setOtpResendAvailableAt(new Date(0).toISOString());
      advanceStep('otp');
      router.push('/signup/verify');
      return;
    }
    try {
      const res = await requestOtp.mutateAsync({ email: values.email });
      setOtpResendAvailableAt(res.resendAvailableAt);
      advanceStep('otp');
      router.push('/signup/verify');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === 'BLOCKED_DOMAIN') {
          form.setError('email', { message: "Personal email domains aren't supported. Please use your work email." });
          return;
        }
        if (e.code === 'DOMAIN_NOT_RECOGNIZED') {
          setEmail(values.email);
          router.push(`/signup/manual-review?email=${encodeURIComponent(values.email)}`);
          return;
        }
        if (e.code === 'RATE_LIMIT') {
          toast.error(friendlyMessageForCode('RATE_LIMIT'));
          return;
        }
        if (e.code === 'CONFLICT') {
          toast.error(friendlyMessageForCode('CONFLICT'));
          return;
        }
      }
      toast.error(friendlyMessageForError(e));
    }
  });

  return (
    <PhoneShell showProgress={false}>
      <CorporateEmailSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <div className="mt-16 flex flex-col items-center">
        <Wordmark size={32} />
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <Heading size={32}>Find your flatmate, verified.</Heading>
        <Subhead>Every Burrow user signs up with their work email. So everyone is who they say they are.</Subhead>
      </div>
      <form className="mt-16 flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        <Input
          label="Work email"
          placeholder="your.name@company.com"
          type="email"
          autoComplete="email"
          disabled={requestOtp.isPending}
          error={form.formState.errors.email?.message}
          microcopy="Personal emails (Gmail, Yahoo) won't work — that's the point."
          {...form.register('email')}
        />
        {isDemoSignup ? (
          <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Demo: no email is sent; code {DEMO_STATIC_OTP} on the next step. Production API needs{' '}
            <code className="rounded bg-surface-muted px-1 dark:bg-dark-surface-muted">DEMO_AUTH_BYPASS=true</code>.
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={requestOtp.isPending} disabled={!form.formState.isValid}>
          {isDemoSignup ? 'Continue' : 'Send verification code'}
        </Button>
      </form>
      <div className="mt-8 flex justify-center">
        <Button type="button" variant="tertiary" onClick={() => setSheetOpen(true)}>
          Why corporate email?
        </Button>
      </div>
      <div className="mt-auto flex justify-center pt-8">
        <Button type="button" variant="tertiary" as={Link} href="/login">
          Already have an account? Log in
        </Button>
      </div>
    </PhoneShell>
  );
}
