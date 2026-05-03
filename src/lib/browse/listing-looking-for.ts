import type { ListingDto } from '@/lib/api/listing-types';

export function buildLookingForBlurb(listing: ListingDto): string {
  const head =
    listing.preferredGender === 'ANYONE'
      ? 'Looking for a flatmate (any gender)'
      : listing.preferredGender === 'WOMAN'
        ? 'Looking for a woman flatmate'
        : 'Looking for a man flatmate';
  const profs = listing.preferredProfessions.filter(Boolean);
  const profPart = profs.length ? `, preferably in ${profs.join(' or ')}` : '';
  const smoke = listing.smokingAllowed ? 'Smoking at home is okay.' : 'Non-smoker preferred.';
  return `${head}${profPart}. ${smoke}`;
}
