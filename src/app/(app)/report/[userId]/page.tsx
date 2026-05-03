'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { toast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useProfilePublicQuery } from '@/lib/hooks/use-profile-public';
import { useReportMutation } from '@/lib/hooks/use-safety';
import { reportFormSchema, type ReportFormInput, REPORT_CATEGORIES } from '@/lib/schemas/report.schemas';
import { cn } from '@/lib/utils/cn';

const CATEGORY_COPY: Record<
  (typeof REPORT_CATEGORIES)[number],
  { title: string; description: string }
> = {
  HARASSMENT: { title: 'Harassment', description: 'Threatening, abusive, or unwanted contact' },
  FAKE_PROFILE: { title: 'Fake profile', description: 'Information seems false or misleading' },
  SCAM_BROKER: { title: 'Scam or broker', description: 'Trying to sell services or collect money' },
  INAPPROPRIATE: {
    title: 'Inappropriate behavior',
    description: 'Sexual content, hate speech, or other inappropriate content',
  },
  OTHER: { title: 'Other', description: 'Something else' },
};

export default function ReportUserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId') ?? undefined;
  const { data: target, isPending, isError, error } = useProfilePublicQuery(userId, Boolean(userId));
  const reportMut = useReportMutation();

  const form = useForm<ReportFormInput>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { detail: '' },
  });

  const detailLen = form.watch('detail')?.length ?? 0;

  useEffect(() => {
    if (!isError) return;
    if (error instanceof ApiError && error.status === 404) {
      toast.error('This profile is not available.');
      router.replace('/browse');
    }
  }, [isError, error, router]);

  const submitReport = form.handleSubmit(async (values) => {
    try {
      const res = await reportMut.mutateAsync({
        reportedUserId: userId,
        conversationId,
        category: values.category,
        detail: values.detail?.trim() ? values.detail.trim() : undefined,
      });
      if (res.httpStatus === 200) {
        toast.info("You've already reported this user.");
      }
      router.replace('/report/submitted');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  });

  if (isPending || (!target && !isError)) {
    return (
      <div className="flex min-h-[50vh] flex-col px-4 pt-4">
        <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </div>
    );
  }

  if (isError || !target) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-36">
      <div className="shrink-0 px-2 pt-2">
        <button
          type="button"
          className="rounded-full p-2 text-ink-primary hover:bg-teal-tint/40 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
      <div className="px-4 pt-2">
        <Heading as="h1" size={28}>
          Report this user
        </Heading>
        <Subhead className="mt-2">
          We review every report within 24 hours. Reporting also blocks them automatically.
        </Subhead>
      </div>

      <div className="mt-6 px-4">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">
          Reporting
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3 dark:border-dark-border dark:bg-dark-surface">
          <Avatar src={target.photoUrl} alt={target.fullName} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">{target.fullName}</p>
            <div className="mt-0.5 flex items-center gap-1">
              {target.user.companyVerified ? (
                <VerifiedBadge size={14} companyName={target.user.companyName} />
              ) : null}
              <span className="truncate font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
                {target.user.companyName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form className="mt-6 flex flex-1 flex-col gap-5 px-4" onSubmit={(e) => void submitReport(e)}>
        <div>
          <p className="font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">Category</p>
          <Controller
            name="category"
            control={form.control}
            render={({ field }) => (
              <div className="mt-3 flex flex-col gap-2">
                {REPORT_CATEGORIES.map((cat) => {
                  const copy = CATEGORY_COPY[cat];
                  const selected = field.value === cat;
                  return (
                    <label
                      key={cat}
                      className={cn(
                        'flex cursor-pointer flex-col gap-0.5 rounded-xl border p-4 transition-colors',
                        selected
                          ? 'border-teal bg-teal-tint/50 dark:border-dark-teal dark:bg-dark-teal-tint/30'
                          : 'border-border bg-surface dark:border-dark-border dark:bg-dark-surface',
                      )}
                    >
                      <input type="radio" className="sr-only" value={cat} checked={selected} onChange={() => field.onChange(cat)} />
                      <span className="font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">{copy.title}</span>
                      <span className="font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">{copy.description}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
          {form.formState.errors.category?.message ? (
            <p className="mt-2 font-sans text-xs text-terracotta dark:text-dark-terracotta" role="alert">
              {form.formState.errors.category.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="report-detail" className="font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">
            Tell us more (optional)
          </label>
          <textarea
            id="report-detail"
            rows={4}
            maxLength={1000}
            className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 font-sans text-sm text-ink-primary outline-none ring-teal/30 focus:border-teal focus:ring-2 dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:focus:border-dark-teal dark:focus:ring-dark-teal/35"
            {...form.register('detail')}
          />
          <p className="mt-1 text-right font-sans text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">{detailLen}/1000</p>
        </div>
      </form>

      <div className="fixed bottom-16 left-0 right-0 z-30 mx-auto flex max-w-[390px] flex-col gap-2 border-t border-border bg-cream/95 px-4 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
        <Button type="button" variant="primary" loading={reportMut.isPending} onClick={() => void submitReport()}>
          Submit report
        </Button>
        <Button type="button" variant="secondary" disabled={reportMut.isPending} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
