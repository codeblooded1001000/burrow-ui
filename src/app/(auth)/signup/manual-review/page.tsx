'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Subhead } from '@/components/ui/Subhead';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useManualReviewMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { ManualReviewSchema, type ManualReviewInput } from '@/lib/schemas/auth.schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function ManualReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeEmail = useOnboardingStore((s) => s.email);
  const mutation = useManualReviewMutation();
  const [done, setDone] = useState(false);

  const emailFromQuery = useMemo(() => searchParams.get('email'), [searchParams]);
  const initialEmail = emailFromQuery ?? storeEmail ?? '';

  const form = useForm<ManualReviewInput>({
    resolver: zodResolver(ManualReviewSchema),
    mode: 'onChange',
    defaultValues: { email: initialEmail, companyClaim: '' },
  });

  useEffect(() => {
    if (initialEmail) {
      form.setValue('email', initialEmail);
    }
  }, [form, initialEmail]);

  useEffect(() => {
    if (!initialEmail) {
      router.replace('/signup');
    }
  }, [initialEmail, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      setDone(true);
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  if (!initialEmail) {
    return null;
  }

  if (done) {
    return (
      <PhoneShell showProgress={false}>
        <div className="mt-16 flex flex-col gap-4 text-center">
          <Heading size={28}>Thanks. We&apos;ll be in touch soon.</Heading>
          <Subhead>Check {form.getValues('email')} for updates.</Subhead>
          <Button type="button" variant="primary" className="mt-8" as={Link} href="/login">
            Back to sign in
          </Button>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell showProgress={false} back onBack={() => router.push('/signup')}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>We don&apos;t know this company yet</Heading>
        <Subhead>We verify new companies manually. We&apos;ll email you within 24 hours.</Subhead>
      </div>
      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <Input label="Work email" type="email" readOnly {...form.register('email')} />
        <Input
          label="Where do you work? (e.g. Acme Technologies Pvt Ltd)"
          placeholder="Company legal name"
          disabled={mutation.isPending}
          error={form.formState.errors.companyClaim?.message}
          {...form.register('companyClaim')}
        />
        <Button type="submit" variant="primary" loading={mutation.isPending} disabled={!form.formState.isValid}>
          Submit for review
        </Button>
        <div className="flex justify-center">
          <Button type="button" variant="tertiary" as={Link} href="/login">
            I&apos;ll come back later
          </Button>
        </div>
      </form>
    </PhoneShell>
  );
}
