'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BackArrow } from '@/components/ui/BackArrow';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { PinInput } from '@/components/ui/PinInput';
import { toast } from '@/components/ui/Toast';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { deleteAccountSchema, type DeleteAccountForm, DELETE_REASON_VALUES } from '@/lib/schemas/delete-account.schemas';
import { useDeleteAccountMutation } from '@/lib/hooks/use-safety';

const REASON_LABELS: Record<'' | (typeof DELETE_REASON_VALUES)[number], string> = {
  '': 'Why are you leaving? (optional)',
  FOUND_FLATMATE: 'Found a flatmate (great!)',
  NO_MATCH: "Didn't find a match",
  PRIVACY: 'Privacy concerns',
  TOO_SLOW: 'Took too long',
  OTHER_APP: 'Switching to another app',
  OTHER: 'Other',
};

export default function DeleteAccountPage() {
  const router = useRouter();
  const del = useDeleteAccountMutation();
  const [scheduled, setScheduled] = useState(false);

  const form = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: { reason: '', pin: '' },
  });

  useEffect(() => {
    if (!scheduled) return;
    const t = window.setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => window.clearTimeout(t);
  }, [scheduled, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await del.mutateAsync({ pin: values.pin });
      setScheduled(true);
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  if (scheduled) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-28 text-center">
        <Heading as="h1" size={24} className="font-serif">
          Account scheduled for deletion
        </Heading>
        <p className="mt-4 max-w-[300px] font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Sign back in within 30 days to recover. Redirecting to login…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pb-28 pt-2">
      <BackArrow onClick={() => router.push('/settings')} />
      <div className="mt-4 rounded-xl border border-terracotta/25 bg-[rgba(197,87,61,0.06)] p-4 dark:border-dark-terracotta/30 dark:bg-[rgba(216,122,96,0.08)]">
        <Heading as="h1" size={22}>
          This will delete your Burrow account.
        </Heading>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
          Your profile, listing, and conversations will be permanently deleted within 30 days. This cannot be undone after 30 days.
        </p>
      </div>

      <form className="mt-8 flex flex-col gap-6" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label htmlFor="leave-reason" className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Why are you leaving?
          </label>
          <select
            id="leave-reason"
            className="mt-2 h-14 w-full rounded-xl border border-border bg-surface px-3 font-sans text-sm text-ink-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            {...form.register('reason')}
          >
            <option value="">{REASON_LABELS['']}</option>
            {DELETE_REASON_VALUES.map((r) => (
              <option key={r} value={r}>
                {REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <PinInput label="Enter your PIN to confirm" value={form.watch('pin')} onChange={(p) => form.setValue('pin', p, { shouldValidate: true })} />
          {form.formState.errors.pin?.message ? (
            <p className="mt-1 font-sans text-xs text-terracotta dark:text-dark-terracotta">{form.formState.errors.pin.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            variant="primary"
            loading={del.isPending}
            disabled={!form.formState.isValid}
            className="bg-terracotta text-cream hover:bg-terracotta/90 disabled:opacity-50 dark:bg-dark-terracotta dark:text-dark-bg"
          >
            Delete permanently
          </Button>
          <Button type="button" variant="secondary" disabled={del.isPending} onClick={() => router.push('/settings')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
