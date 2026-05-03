'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BackArrow } from '@/components/ui/BackArrow';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useUpdateRoleMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { useExportDataMutation, useUpdateNotificationPrefsMutation, type NotificationPrefsBody } from '@/lib/hooks/use-safety';

type RoleChoice = 'LISTER' | 'SEEKER' | 'BOTH';

const ROLE_OPTIONS: { id: RoleChoice; title: string; subtitle: string }[] = [
  { id: 'LISTER', title: 'I have a flat', subtitle: 'List a place and find a flatmate' },
  { id: 'SEEKER', title: "I'm looking for a flat", subtitle: 'Browse homes and join a listing' },
  { id: 'BOTH', title: "I'm flexible", subtitle: 'Use both flats and flatmates on Explore' },
];

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="font-sans text-[15px] text-ink-primary dark:text-dark-ink-primary">{label}</p>
        {sublabel ? <p className="mt-0.5 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{sublabel}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-teal dark:bg-dark-teal' : 'bg-border dark:bg-dark-border'}`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-cream shadow transition-transform dark:bg-dark-bg ${value ? 'left-[21px]' : 'left-[3px]'}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const updateRole = useUpdateRoleMutation();
  const stubPrefs = useUpdateNotificationPrefsMutation();
  const exportMut = useExportDataMutation();

  const [newMessages, setNewMessages] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [showLastActive, setShowLastActive] = useState(true);

  const saveStub = (patch: NotificationPrefsBody) => {
    void stubPrefs.mutateAsync(patch).then(() => {
      toast.success('Saved.');
    });
  };

  const onExport = async () => {
    try {
      const { blob, filename } = await exportMut.mutateAsync();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started.');
    } catch {
      toast.error('Could not export data.');
    }
  };

  return (
    <div className="flex flex-col px-4 pb-28 pt-2">
      <BackArrow onClick={() => router.push('/account')} />
      <h1 className="mt-4 font-serif text-[26px] font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">Settings</h1>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">How you use Burrow</p>
        <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
          This controls what you can do on Explore (flats vs flatmates), not just the tab you are on.
        </p>
        {user?.role == null ? (
          <div className="mt-2 rounded-xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
            <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Finish onboarding to choose a role.</p>
            <Link
              href="/onboarding/basics"
              className="mt-2 inline-block font-sans text-sm font-medium text-teal underline dark:text-dark-teal"
            >
              Continue setup
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {ROLE_OPTIONS.map((r) => (
              <Card
                key={r.id}
                variant="selectable"
                className="min-h-0 py-3"
                aria-label={`Set role: ${r.title}`}
                selected={user.role === r.id}
                disabled={updateRole.isPending}
                onSelect={() => {
                  if (user.role === r.id || updateRole.isPending) return;
                  void updateRole
                    .mutateAsync({ role: r.id })
                    .then(() => toast.success('Saved.'))
                    .catch((e) => toast.error(friendlyMessageForError(e)));
                }}
              >
                <p className="font-serif text-base font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">{r.title}</p>
                <p className="mt-1 font-sans text-xs leading-snug text-ink-secondary dark:text-dark-ink-secondary">{r.subtitle}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">Commute</p>
        <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
          Optional office pin — we use it to show drive time from flats you open. We will use it to show you a little
          magic. Trust us.
        </p>
        <Link
          href="/settings/office"
          className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-sm font-medium text-ink-primary transition-colors hover:border-teal/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:hover:border-dark-teal/35"
        >
          <span>Office location</span>
          <span className="text-ink-tertiary dark:text-dark-ink-tertiary" aria-hidden>
            →
          </span>
        </Link>
      </section>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">Notifications</p>
        <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">Email only at MVP — no push.</p>
        <div className="mt-2 divide-y divide-border rounded-xl border border-border bg-surface px-3 dark:divide-dark-border dark:border-dark-border dark:bg-dark-surface">
          <ToggleRow
            label="New messages"
            value={newMessages}
            onChange={(v) => {
              setNewMessages(v);
              saveStub({ newMessages: v });
            }}
          />
          <ToggleRow
            label="New matches in your area"
            sublabel="Weekly digest"
            value={newMatches}
            onChange={(v) => {
              setNewMatches(v);
              saveStub({ newMatchesDigest: v });
            }}
          />
          <ToggleRow
            label="Weekly digest"
            value={weeklyDigest}
            onChange={(v) => {
              setWeeklyDigest(v);
              saveStub({ weeklyDigest: v });
            }}
          />
        </div>
      </section>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">Privacy</p>
        <div className="mt-2 rounded-xl border border-border bg-surface px-3 dark:border-dark-border dark:bg-dark-surface">
          <ToggleRow
            label="Show my last-active status"
            value={showLastActive}
            onChange={(v) => {
              setShowLastActive(v);
              saveStub({ showLastActive: v });
            }}
          />
        </div>
      </section>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">Data</p>
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 dark:border-dark-border dark:bg-dark-surface">
          <button
            type="button"
            className="text-left font-sans text-sm font-medium text-teal underline dark:text-dark-teal"
            disabled={exportMut.isPending}
            onClick={() => void onExport()}
          >
            Download my data
          </button>
          <Link
            href="/settings/delete-account"
            className="font-sans text-sm font-medium text-terracotta underline dark:text-dark-terracotta"
          >
            Delete my account
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">About</p>
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 dark:border-dark-border dark:bg-dark-surface">
          <a href="https://burrow.in/privacy" target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-teal underline dark:text-dark-teal">
            Privacy policy
          </a>
          <a href="https://burrow.in/terms" target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-teal underline dark:text-dark-teal">
            Terms of service
          </a>
          <p className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">Version 1.0.0</p>
        </div>
      </section>
    </div>
  );
}
