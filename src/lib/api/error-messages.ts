import { ApiError } from '@/lib/api/client';

/** Keep in sync with user-facing copy; codes from `API_CONTRACT.md`. */
const FRIENDLY_MESSAGES: Record<string, string> = {
  BLOCKED_DOMAIN: "Personal email domains aren't supported. Please use your work email.",
  DOMAIN_NOT_RECOGNIZED: "We don't recognize this company yet.",
  INVALID_OTP: "That code didn't work. Try again.",
  OTP_EXPIRED: 'Code expired. Tap resend.',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Start again with a new code.',
  WEAK_PIN: 'Try a less obvious PIN — avoid sequences and repeats.',
  PIN_MISMATCH: "PINs don't match.",
  INVALID_CREDENTIALS: 'Email or PIN is incorrect.',
  ACCOUNT_LOCKED: 'Too many wrong attempts. Try again later.',
  RATE_LIMIT: 'Too many requests. Try again in a few minutes.',
  NETWORK_ERROR: 'Check your connection and try again.',
  UNAUTHENTICATED: 'Sign in to continue.',
  NOT_FOUND: 'No account found for that email.',
  PHONE_NOT_FOUND: 'No account found with that phone number.',
  INVALID_TOKEN: 'Your session expired. Start again.',
  CONFLICT: 'An account with this email already exists.',
  INVALID_INPUT: 'Check the highlighted fields and try again.',
  LISTING_ALREADY_EXISTS: 'You already have a listing. Edit it instead.',
  INVALID_LOCALITY: 'Please pick a Gurgaon locality from the list.',
  INVALID_BUDGET_RANGE: "Your share can't be more than total rent.",
  PHOTO_UPLOAD_FAILED: 'Photo upload did not work. Try again.',
  LIFESTYLE_TAGS_EXCEEDED: 'Pick up to 3 lifestyle tags.',
  PROFILE_INCOMPLETE: 'Fill in all required fields.',
  REQUEST_PENDING_ACCEPTANCE:
    "They haven't accepted your request yet. You can send another message once they reply.",
  CONVERSATION_CLOSED: 'This conversation is no longer available.',
  CANNOT_SEND_REQUEST: 'Cannot send request to this user.',
};

export function friendlyMessageForCode(code: string): string {
  return FRIENDLY_MESSAGES[code] ?? 'Something went wrong. Try again.';
}

export function friendlyMessageForError(err: unknown): string {
  if (err instanceof ApiError) {
    return friendlyMessageForCode(err.code);
  }
  if (err instanceof Error) {
    return err.message;
  }
  return friendlyMessageForCode('UNKNOWN');
}

export function lockedWaitMinutes(err: ApiError): number | null {
  const raw = err.details as { retryAfter?: number } | undefined;
  if (raw?.retryAfter != null && typeof raw.retryAfter === 'number') {
    return Math.max(1, Math.ceil(raw.retryAfter / 60));
  }
  return null;
}
