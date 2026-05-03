'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';

export type ProfilePreviewProps = {
  /** Resolved HTTPS URL or null to show initials only. */
  photoUrl?: string | null;
  fullName: string;
  bio: string;
  profession: string;
  localities: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  tags: string[];
};

export function ProfilePreviewCard({
  photoUrl = null,
  fullName,
  bio,
  profession,
  localities,
  budgetMin,
  budgetMax,
  tags,
}: ProfilePreviewProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex justify-center">
        <Avatar src={photoUrl} alt={fullName} size={64} fallbackLetter={fullName} />
      </div>
      <Heading as="h2" size={22}>
        {fullName}
      </Heading>
      {profession ? <Subhead className="mt-1">{profession}</Subhead> : null}
      <p className="mt-3 line-clamp-4 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{bio || 'Bio'}</p>
      {localities.length > 0 ? (
        <p className="mt-2 font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{localities.join(' · ')}</p>
      ) : null}
      {budgetMin != null && budgetMax != null ? (
        <p className="mt-1 font-sans text-xs text-ink-secondary dark:text-dark-ink-secondary">
          Budget ₹{budgetMin.toLocaleString('en-IN')} – ₹{budgetMax.toLocaleString('en-IN')}
        </p>
      ) : null}
      {tags.length > 0 ? <p className="mt-2 font-sans text-xs text-teal dark:text-dark-teal">{tags.join(' · ')}</p> : null}
    </Card>
  );
}
