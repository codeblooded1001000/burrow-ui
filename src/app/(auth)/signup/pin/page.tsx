'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { PinInput } from '@/components/ui/PinInput';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForCode, friendlyMessageForError } from '@/lib/api/error-messages';
import { useSetPinMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { SetPinSchema, type SetPinInput } from '@/lib/schemas/auth.schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function SignupPinPage() {
  const router = useRouter();
  const signupToken = useOnboardingStore((s) => s.signupToken);
  const advanceStep = useOnboardingStore((s) => s.advanceStep);
  const setPinMutation = useSetPinMutation();

  const form = useForm<SetPinInput>({
    resolver: zodResolver(SetPinSchema),
    mode: 'onChange',
    defaultValues: { signupToken: signupToken ?? '', pin: '', confirmPin: '' },
  });

  useEffect(() => {
    if (!signupToken) {
      router.replace('/signup');
      return;
    }
    form.setValue('signupToken', signupToken);
  }, [form, router, signupToken]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await setPinMutation.mutateAsync({
        signupToken: values.signupToken,
        pin: values.pin,
        confirmPin: values.confirmPin,
      });
      advanceStep('basics');
      router.push('/onboarding/basics');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === 'PIN_MISMATCH') {
          form.setError('confirmPin', { message: friendlyMessageForCode('PIN_MISMATCH') });
          return;
        }
        if (e.code === 'WEAK_PIN') {
          form.setError('pin', { message: friendlyMessageForCode('WEAK_PIN') });
          return;
        }
        if (e.code === 'INVALID_TOKEN') {
          toast.error('Your session expired. Start again.');
          router.replace('/signup');
          return;
        }
      }
      toast.error(friendlyMessageForError(e));
    }
  });

  if (!signupToken) {
    return null;
  }

  const pin = form.watch('pin');
  const confirm = form.watch('confirmPin');
  const canSubmit =
    form.formState.isValid && pin.length === 6 && confirm.length === 6 && pin === confirm && !setPinMutation.isPending;

  return (
    <PhoneShell progress={33} back onBack={() => router.push('/signup/verify')}>
      <input type="hidden" {...form.register('signupToken')} />
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>Set a 6-digit PIN</Heading>
        <Subhead>You will use this to sign in. Make it easy to remember, hard to guess.</Subhead>
      </div>
      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <Controller
          name="pin"
          control={form.control}
          render={({ field }) => <PinInput label="Choose PIN" value={field.value} onChange={field.onChange} disabled={setPinMutation.isPending} />}
        />
        {form.formState.errors.pin?.message ? (
          <p className="font-sans text-xs text-terracotta dark:text-dark-terracotta" role="alert">
            {form.formState.errors.pin.message}
          </p>
        ) : null}
        <Controller
          name="confirmPin"
          control={form.control}
          render={({ field }) => (
            <PinInput label="Confirm PIN" value={field.value} onChange={field.onChange} disabled={setPinMutation.isPending} />
          )}
        />
        {form.formState.errors.confirmPin?.message ? (
          <p className="font-sans text-xs text-terracotta dark:text-dark-terracotta" role="alert">
            {form.formState.errors.confirmPin.message}
          </p>
        ) : null}
        <span className="font-sans text-xs leading-normal text-ink-tertiary dark:text-dark-ink-tertiary">
          Avoid obvious sequences (123456, your birth year, repeating digits).
        </span>
        <Button type="submit" variant="primary" loading={setPinMutation.isPending} disabled={!canSubmit}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
