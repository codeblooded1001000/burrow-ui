import { z } from 'zod';

export const DELETE_REASON_VALUES = [
  'FOUND_FLATMATE',
  'NO_MATCH',
  'PRIVACY',
  'TOO_SLOW',
  'OTHER_APP',
  'OTHER',
] as const;

export const deleteAccountSchema = z.object({
  reason: z.union([z.literal(''), z.enum(DELETE_REASON_VALUES)]),
  pin: z.string().regex(/^\d{6}$/, 'Enter your 6-digit PIN'),
});

export type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;
