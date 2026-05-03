'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Wordmark } from '@/components/brand/Wordmark';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { PinInput } from '@/components/ui/PinInput';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForCode, friendlyMessageForError, lockedWaitMinutes } from '@/lib/api/error-messages';
import { useLoginMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { LoginSchema, type LoginInput } from '@/lib/schemas/auth.schemas';

export default function LoginPage() {
  const router = useRouter();
  const login = useLoginMutation();
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', pin: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLockMessage(null);
    form.clearErrors('root');
    try {
      await login.mutateAsync({ email: values.email, pin: values.pin });
      router.push('/browse');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === 'INVALID_CREDENTIALS') {
          form.setError('root', { message: "Email or PIN is incorrect." });
          return;
        }
        if (e.code === 'ACCOUNT_LOCKED') {
          const minutes = lockedWaitMinutes(e);
          setLockMessage(
            minutes != null
              ? `Too many wrong attempts. Try again in ${minutes} minutes.`
              : friendlyMessageForCode('ACCOUNT_LOCKED'),
          );
          return;
        }
      }
      form.setError('root', { message: friendlyMessageForError(e) });
    }
  });

  const disabled = login.isPending || !form.formState.isValid;

  return (
    <PhoneShell showProgress={false}>
      <div className="mt-16 flex flex-col items-center">
        <Wordmark size={32} />
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <Heading size={32}>Welcome back.</Heading>
        <Subhead>Sign in with your work email and PIN.</Subhead>
      </div>
      <form className="mt-12 flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        {form.formState.errors.root?.message ? (
          <p className="font-sans text-sm text-red-600 dark:text-red-400" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        {lockMessage ? (
          <p className="font-sans text-sm text-red-600 dark:text-red-400" role="alert">
            {lockMessage}
          </p>
        ) : null}
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          disabled={login.isPending}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Controller
          name="pin"
          control={form.control}
          render={({ field }) => (
            <PinInput
              label="PIN"
              value={field.value}
              onChange={field.onChange}
              disabled={login.isPending}
              autoComplete="current-password"
            />
          )}
        />
        <Button type="submit" variant="primary" loading={login.isPending} disabled={disabled}>
          Sign in
        </Button>
      </form>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button type="button" variant="tertiary" as={Link} href="/login/forgot-pin">
          Forgot PIN?
        </Button>
        <Button type="button" variant="tertiary" as={Link} href="/recover-phone">
          Lost access to your email?
        </Button>
      </div>
      {lockMessage ? (
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="tertiary" as={Link} href="/login/forgot-pin">
            Forgot PIN?
          </Button>
        </div>
      ) : null}
      <div className="mt-auto flex justify-center pt-8">
        <Button type="button" variant="tertiary" as={Link} href="/signup">
          New here? Create account
        </Button>
      </div>
    </PhoneShell>
  );
}
