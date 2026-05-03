'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { getAccountInitials } from '@/lib/utils/name-initials';

export function AccountHeaderAvatar() {
  const { user, isPending } = useCurrentUser();

  const label = user?.fullName?.trim() || user?.email || 'Account';
  const initialsSource = user ? getAccountInitials(user.fullName, user.email) : 'Account';

  return (
    <Link
      href="/account"
      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35"
      aria-label="Account"
    >
      {isPending ? (
        <span className="inline-block h-8 w-8 animate-pulse rounded-full bg-border dark:bg-dark-border" aria-hidden />
      ) : (
        <Avatar src={user?.photoUrl} alt={label} fallbackLetter={initialsSource} size={32} />
      )}
    </Link>
  );
}
