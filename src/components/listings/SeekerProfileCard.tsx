'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { ProfileWithMatch } from '@/lib/api/listing-types';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { Avatar } from '@/components/ui/Avatar';

type SeekerProfileCardProps = {
  profile: ProfileWithMatch;
  className?: string;
};

function formatMoveIn(iso: string | null): string {
  if (!iso) return 'Flexible';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Flexible';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SeekerProfileCard({ profile, className }: SeekerProfileCardProps) {
  const budget =
    profile.budgetMin != null && profile.budgetMax != null
      ? `₹${profile.budgetMin.toLocaleString('en-IN')} – ₹${profile.budgetMax.toLocaleString('en-IN')}`
      : 'Budget flexible';

  return (
    <Link
      href={`/profiles/${profile.userId}`}
      className={cn(
        'flex gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-teal/30 dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-teal/35',
        className,
      )}
    >
      <Avatar src={profile.photoUrl} alt={profile.fullName} fallbackLetter={profile.fullName} size={80} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
          {profile.fullName}, {profile.age}
        </p>
        <p className="mt-0.5 truncate font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          {profile.preferredLocalities.length ? profile.preferredLocalities.join(' · ') : 'Localities TBD'}
        </p>
        <p className="mt-0.5 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{budget}</p>
        <p className="mt-0.5 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">Move in by {formatMoveIn(profile.moveInDate)}</p>
        {profile.lifestyleTags.length > 0 ? (
          <p className="mt-1 line-clamp-2 font-sans text-xs text-teal dark:text-dark-teal">{profile.lifestyleTags.join(' · ')}</p>
        ) : null}
        <div className="mt-2">
          <VerifiedBadge size={14} companyName={profile.user.companyVerified ? profile.user.companyName : undefined} className="min-w-0" />
        </div>
      </div>
    </Link>
  );
}
