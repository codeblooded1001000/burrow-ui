import { describe, expect, it } from 'vitest';
import { getAccountInitials, getNameInitials } from '@/lib/utils/name-initials';

describe('getNameInitials', () => {
  it('uses first and last word for multi-word names', () => {
    expect(getNameInitials('Priya Sharma')).toBe('PS');
  });

  it('uses first two letters for single word', () => {
    expect(getNameInitials('Rahul')).toBe('RA');
  });

  it('handles single character', () => {
    expect(getNameInitials('A')).toBe('A');
  });
});

describe('getAccountInitials', () => {
  it('prefers full name when present', () => {
    expect(getAccountInitials('Ananya Collector', 'ignore@x.com')).toBe('AC');
  });

  it('derives from email local part when no name', () => {
    expect(getAccountInitials(null, 'ananya.collector@corp.com')).toBe('AC');
    expect(getAccountInitials(undefined, 'solo@corp.com')).toBe('SO');
  });
});
