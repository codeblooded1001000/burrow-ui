'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import {
  useConfirmNewEmailMutation,
  usePhoneRecoveryMutation,
  usePhoneUpdateEmailMutation,
  usePhoneVerifyMutation,
} from '@/lib/hooks/auth/use-auth-mutations';
import {
  ConfirmNewEmailSchema,
  RecoverNewEmailStepSchema,
  type ConfirmNewEmailInput,
  type RecoverNewEmailStepInput,
} from '@/lib/schemas/auth.schemas';

const LocalMobileSchema = z.object({
  local: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number after +91'),
});

type LocalMobileInput = z.infer<typeof LocalMobileSchema>;

type Step = 'phone' | 'phoneOtp' | 'newEmail' | 'emailOtp';

export default function RecoverPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [e164, setE164] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [pendingNewEmail, setPendingNewEmail] = useState('');

  const phoneRequest = usePhoneRecoveryMutation();
  const phoneVerify = usePhoneVerifyMutation();
  const updateEmail = usePhoneUpdateEmailMutation();
  const confirmEmail = useConfirmNewEmailMutation();

  const phoneForm = useForm<LocalMobileInput>({
    resolver: zodResolver(LocalMobileSchema),
    mode: 'onChange',
    defaultValues: { local: '' },
  });

  const phoneOtpForm = useForm<{ otp: string }>({
    resolver: zodResolver(z.object({ otp: z.string().length(6).regex(/^\d{6}$/) })),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const newEmailForm = useForm<RecoverNewEmailStepInput>({
    resolver: zodResolver(RecoverNewEmailStepSchema),
    mode: 'onChange',
    defaultValues: { newEmail: '' },
  });

  const confirmForm = useForm<ConfirmNewEmailInput>({
    resolver: zodResolver(ConfirmNewEmailSchema),
    mode: 'onChange',
    defaultValues: { recoveryToken: '', newEmail: '', otp: '' },
  });

  const onSendPhoneOtp = phoneForm.handleSubmit(async (values) => {
    const phoneNumber = `+91${values.local}`;
    try {
      await phoneRequest.mutateAsync({ phoneNumber });
      setE164(phoneNumber);
      setStep('phoneOtp');
      toast.success('If this number is on your account, you will receive a code.');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  const onVerifyPhone = phoneOtpForm.handleSubmit(async (values) => {
    try {
      const res = await phoneVerify.mutateAsync({ phoneNumber: e164, otp: values.otp });
      setRecoveryToken(res.recoveryToken);
      confirmForm.setValue('recoveryToken', res.recoveryToken);
      setStep('newEmail');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  const onRequestEmailOtp = newEmailForm.handleSubmit(async (values) => {
    try {
      await updateEmail.mutateAsync({ recoveryToken, newEmail: values.newEmail });
      setPendingNewEmail(values.newEmail);
      confirmForm.setValue('newEmail', values.newEmail);
      confirmForm.setValue('recoveryToken', recoveryToken);
      void confirmForm.trigger(['newEmail', 'recoveryToken']);
      setStep('emailOtp');
      toast.success('Check the new inbox for a verification code.');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'DOMAIN_NOT_RECOGNIZED') {
        router.push(`/signup/manual-review?email=${encodeURIComponent(values.newEmail)}`);
        return;
      }
      toast.error(friendlyMessageForError(e));
    }
  });

  const onConfirmEmail = confirmForm.handleSubmit(async (values) => {
    try {
      await confirmEmail.mutateAsync(values);
      toast.success('Your email is updated. Sign in with the new address.');
      router.push('/login');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  return (
    <PhoneShell showProgress={false} back onBack={() => router.push('/login')}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>Lost access to your work email?</Heading>
        <Subhead>{`If you added a phone number to your account, we can verify it's you and let you update your email.`}</Subhead>
      </div>

      {step === 'phone' ? (
        <form className="mt-8 flex flex-col gap-6" onSubmit={onSendPhoneOtp} noValidate>
          <div>
            <label htmlFor="recover-local" className="mb-2 block font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
              Mobile number
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
              <span className="shrink-0 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">+91</span>
              <input
                id="recover-local"
                inputMode="numeric"
                autoComplete="tel-national"
                className="min-w-0 flex-1 bg-transparent font-sans text-base text-ink-primary outline-none dark:text-dark-ink-primary"
                placeholder="9876543210"
                disabled={phoneRequest.isPending}
                {...phoneForm.register('local')}
              />
            </div>
            {phoneForm.formState.errors.local?.message ? (
              <p className="mt-1 font-sans text-sm text-red-600 dark:text-red-400">{phoneForm.formState.errors.local.message}</p>
            ) : null}
          </div>
          <Button type="submit" variant="primary" loading={phoneRequest.isPending} disabled={!phoneForm.formState.isValid || phoneRequest.isPending}>
            Send code
          </Button>
        </form>
      ) : null}

      {step === 'phoneOtp' ? (
        <form className="mt-8 flex flex-col gap-6" onSubmit={onVerifyPhone} noValidate>
          <Subhead>Enter the code we sent to {e164}.</Subhead>
          <Controller
            name="otp"
            control={phoneOtpForm.control}
            render={({ field }) => (
              <OtpInput label="One-time code" value={field.value} onChange={field.onChange} disabled={phoneVerify.isPending} />
            )}
          />
          <Button type="submit" variant="primary" loading={phoneVerify.isPending} disabled={!phoneOtpForm.formState.isValid || phoneVerify.isPending}>
            Verify phone
          </Button>
          <Button type="button" variant="tertiary" onClick={() => setStep('phone')}>
            Change number
          </Button>
        </form>
      ) : null}

      {step === 'newEmail' ? (
        <form className="mt-8 flex flex-col gap-6" onSubmit={onRequestEmailOtp} noValidate>
          <Heading size={22}>Update email</Heading>
          <Subhead>Use your new work email. We will send a code there next.</Subhead>
          <Input
            label="New work email"
            type="email"
            autoComplete="email"
            disabled={updateEmail.isPending}
            error={newEmailForm.formState.errors.newEmail?.message}
            {...newEmailForm.register('newEmail')}
          />
          <Button type="submit" variant="primary" loading={updateEmail.isPending} disabled={!newEmailForm.formState.isValid || updateEmail.isPending}>
            Send code to new email
          </Button>
        </form>
      ) : null}

      {step === 'emailOtp' ? (
        <form className="mt-8 flex flex-col gap-6" onSubmit={onConfirmEmail} noValidate>
          <Subhead>Enter the code sent to {pendingNewEmail}.</Subhead>
          <input type="hidden" {...confirmForm.register('recoveryToken')} />
          <input type="hidden" {...confirmForm.register('newEmail')} />
          <Controller
            name="otp"
            control={confirmForm.control}
            render={({ field }) => (
              <OtpInput label="One-time code" value={field.value} onChange={field.onChange} disabled={confirmEmail.isPending} />
            )}
          />
          <Button type="submit" variant="primary" loading={confirmEmail.isPending} disabled={!confirmForm.formState.isValid || confirmEmail.isPending}>
            Confirm new email
          </Button>
        </form>
      ) : null}

      <div className="mt-auto flex justify-center pt-8">
        <Button type="button" variant="tertiary" as={Link} href="/login">
          Back to sign in
        </Button>
      </div>
    </PhoneShell>
  );
}
