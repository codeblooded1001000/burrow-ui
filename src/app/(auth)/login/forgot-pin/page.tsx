'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { PinInput } from '@/components/ui/PinInput';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useForgotPinMutation, useResetPinMutation } from '@/lib/hooks/auth/use-auth-mutations';
import {
  RecoverRequestOtpSchema,
  RecoverVerifyResetSchema,
  type RecoverRequestOtpInput,
  type RecoverVerifyResetInput,
} from '@/lib/schemas/auth.schemas';

type Phase = 'email' | 'reset';

export default function ForgotPinPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('email');
  const [lockedEmail, setLockedEmail] = useState('');
  const requestOtp = useForgotPinMutation();
  const resetPin = useResetPinMutation();

  const emailForm = useForm<RecoverRequestOtpInput>({
    resolver: zodResolver(RecoverRequestOtpSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const resetForm = useForm<RecoverVerifyResetInput>({
    resolver: zodResolver(RecoverVerifyResetSchema),
    mode: 'onChange',
    defaultValues: { email: '', otp: '', newPin: '', confirmNewPin: '' },
  });

  useEffect(() => {
    if (lockedEmail) {
      resetForm.setValue('email', lockedEmail);
    }
  }, [lockedEmail, resetForm]);

  const onRequest = emailForm.handleSubmit(async (values) => {
    try {
      await requestOtp.mutateAsync({ email: values.email });
      setLockedEmail(values.email);
      setPhase('reset');
      toast.success('Check your inbox for a code.');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  const onReset = resetForm.handleSubmit(async (values) => {
    try {
      await resetPin.mutateAsync(values);
      router.push('/browse');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === 'WEAK_PIN') {
          resetForm.setError('newPin', { message: 'Try a less obvious PIN.' });
          return;
        }
      }
      toast.error(friendlyMessageForError(e));
    }
  });

  const loadingRequest = requestOtp.isPending;
  const loadingReset = resetPin.isPending;

  return (
    <PhoneShell showProgress={false} back onBack={() => router.push('/login')}>
      {phase === 'email' ? (
        <>
          <div className="mt-6 flex flex-col gap-3">
            <Heading size={28}>Reset your PIN</Heading>
            <Subhead>We will email you a one-time code.</Subhead>
          </div>
          <form className="mt-8 flex flex-col gap-6" onSubmit={onRequest} noValidate>
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              disabled={loadingRequest}
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register('email')}
            />
            <Button type="submit" variant="primary" loading={loadingRequest} disabled={!emailForm.formState.isValid || loadingRequest}>
              Send code
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3">
            <Heading size={28}>Choose a new PIN</Heading>
            <Subhead>Enter the code we sent to {lockedEmail}.</Subhead>
          </div>
          <form className="mt-8 flex flex-col gap-6" onSubmit={onReset} noValidate>
            <input type="hidden" {...resetForm.register('email')} />
            <Controller
              name="otp"
              control={resetForm.control}
              render={({ field }) => (
                <OtpInput label="One-time code" value={field.value} onChange={field.onChange} disabled={loadingReset} />
              )}
            />
            <Controller
              name="newPin"
              control={resetForm.control}
              render={({ field }) => (
                <PinInput label="New PIN" value={field.value} onChange={field.onChange} disabled={loadingReset} />
              )}
            />
            <Controller
              name="confirmNewPin"
              control={resetForm.control}
              render={({ field }) => (
                <PinInput
                  label="Confirm new PIN"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loadingReset}
                  className={resetForm.formState.errors.confirmNewPin ? 'ring-1 ring-red-500/30 rounded-lg' : undefined}
                />
              )}
            />
            {resetForm.formState.errors.confirmNewPin?.message ? (
              <p className="font-sans text-sm text-red-600 dark:text-red-400">{resetForm.formState.errors.confirmNewPin.message}</p>
            ) : null}
            {resetForm.formState.errors.newPin?.message ? (
              <p className="font-sans text-sm text-red-600 dark:text-red-400">{resetForm.formState.errors.newPin.message}</p>
            ) : null}
            <Button type="submit" variant="primary" loading={loadingReset} disabled={!resetForm.formState.isValid || loadingReset}>
              Update PIN and sign in
            </Button>
            <div className="flex justify-center">
              <Button type="button" variant="tertiary" onClick={() => setPhase('email')}>
                Use a different email
              </Button>
            </div>
          </form>
        </>
      )}
      <div className="mt-auto flex justify-center pt-8">
        <Button type="button" variant="tertiary" as={Link} href="/login">
          Back to sign in
        </Button>
      </div>
    </PhoneShell>
  );
}
