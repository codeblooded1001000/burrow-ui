'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { ChevronRight, Pencil } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { ProfilePreviewCard } from '@/components/profile/ProfilePreviewCard';
import { ListingPreviewCard } from '@/components/listings/ListingPreviewCard';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { useGetMyProfileQuery } from '@/lib/hooks/use-profiles';
import { useGetMyListingQuery } from '@/lib/hooks/use-listings';
import { useLogoutMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { toast } from '@/components/ui/Toast';
import { friendlyMessageForError } from '@/lib/api/error-messages';

function MenuRow({
  href,
  label,
  external,
  onClick,
}: {
  href?: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const className =
    'flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left font-sans text-sm font-medium text-ink-primary transition-colors hover:border-teal/30 dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:hover:border-dark-teal/35';
  const inner = (
    <>
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary dark:text-dark-ink-tertiary" aria-hidden />
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }
  if (external && href) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href as Route} className={className}>
        {inner}
      </Link>
    );
  }
  return null;
}

export default function AccountPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: profile, isSuccess: profileOk } = useGetMyProfileQuery(Boolean(user));
  const { data: listing, isSuccess: listingOk } = useGetMyListingQuery(Boolean(user?.hasListing));
  const logout = useLogoutMutation();

  const showListing = Boolean(user?.hasListing && listingOk && listing);
  const showProfile = Boolean(profileOk && profile);

  return (
    <div className="flex flex-col gap-6 px-4 pb-28 pt-4">
      <div className="flex flex-col items-center text-center">
        <Avatar src={user?.photoUrl} alt={user?.fullName ?? 'You'} size={96} fallbackLetter={user?.fullName ?? '?'} />
        <h1 className="mt-4 flex max-w-[min(100%,20rem)] flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-center font-serif text-[22px] font-medium leading-snug tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">
          <span>{user?.fullName ?? 'Your account'}</span>
          {profile ? (
            <>
              <span className="select-none text-ink-tertiary dark:text-dark-ink-tertiary" aria-hidden>
                ·
              </span>
              <span className="tabular-nums">{profile.age}</span>
            </>
          ) : null}
        </h1>
        {user?.companyVerified ? (
          <p className="mt-2 flex max-w-[min(100%,20rem)] flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-sm leading-normal text-ink-secondary dark:text-dark-ink-secondary">
            <VerifiedBadge
              size={14}
              companyName={user.companyName}
              companyClassName="font-normal text-ink-secondary dark:text-dark-ink-secondary"
            />
          </p>
        ) : null}
        <Link
          href="/profile/edit?from=account"
          className="mt-3 inline-flex items-center gap-1 font-sans text-sm font-medium text-teal dark:text-dark-teal"
          aria-label="Edit profile"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Edit
        </Link>
      </div>

      {showListing && listing ? (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 dark:border-dark-border">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">
              My listing
            </span>
            <Button as={Link} href="/listing/edit" variant="tertiary" size="sm" className="w-auto py-1">
              Edit
            </Button>
          </div>
          <ListingPreviewCard
            localityName={listing.localityName}
            bhk={listing.bhk}
            totalRent={listing.totalRent}
            yourShare={listing.yourShare}
            description={listing.description}
            photos={listing.photos}
            amenities={listing.amenities}
          />
        </Card>
      ) : null}

      {showProfile && profile ? (
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 dark:border-dark-border">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-tertiary dark:text-dark-ink-tertiary">
              My profile
            </span>
            <Button as={Link} href="/profile/edit?from=account" variant="tertiary" size="sm" className="w-auto py-1">
              Edit
            </Button>
          </div>
          <div className="p-2">
            <ProfilePreviewCard
              photoUrl={profile.photoUrl}
              fullName={profile.fullName}
              bio={profile.bio}
              profession={profile.profession ?? ''}
              localities={profile.preferredLocalities}
              budgetMin={profile.budgetMin}
              budgetMax={profile.budgetMax}
              tags={profile.lifestyleTags}
            />
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2">
        <MenuRow href="/settings" label="Settings" />
        <MenuRow href="/blocked-users" label="Blocked users" />
        <MenuRow href="mailto:support@burrow.in" label="Help & support" external />
        <MenuRow href="/about" label="About Burrow" />
        <MenuRow
          label="Sign out"
          onClick={async () => {
            try {
              await logout.mutateAsync();
              router.replace('/login');
            } catch (e) {
              toast.error(friendlyMessageForError(e));
            }
          }}
        />
      </div>
    </div>
  );
}
