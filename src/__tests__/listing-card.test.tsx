import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from '@/components/listings/ListingCard';
import type { ListingWithMatch } from '@/lib/api/listing-types';

const listing: ListingWithMatch = {
  id: 'l1',
  userId: 'u1',
  localityName: 'Cyber City',
  lat: 28.45,
  lng: 77.09,
  bhk: 2,
  totalRent: 50000,
  yourShare: 22000,
  availableFrom: new Date().toISOString(),
  photos: ['https://cdn.burrow.in/u/a.jpg'],
  description: 'Bright flat.',
  amenities: ['Wi-Fi'],
  preferredGender: 'ANYONE',
  preferredProfessions: ['Software engineer'],
  smokingAllowed: false,
  foodPref: 'NON_VEG_OK',
  workSchedulePref: 'FLEXIBLE',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  matchScore: 42,
  lister: {
    id: 'u1',
    fullName: 'Priya Sharma',
    age: 28,
    gender: 'WOMAN',
    photoUrl: null,
    profession: 'Software engineer',
    companyName: 'Blinkit',
    companyVerified: true,
  },
};

describe('ListingCard', () => {
  it('renders title and locality', () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByText(/₹22,000\/mo · 2 BHK/i)).toBeVisible();
    expect(screen.getByText(/Cyber City/i)).toBeVisible();
  });

  it('links to listing detail', () => {
    render(<ListingCard listing={listing} />);
    const detail = screen.getByRole('link', { name: /₹22,000\/mo · 2 BHK/i });
    expect(detail).toHaveAttribute('href', '/listings/l1');
  });

  it('exposes expand-photos control', () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByRole('button', { name: /Expand photos/i })).toBeVisible();
  });
});
