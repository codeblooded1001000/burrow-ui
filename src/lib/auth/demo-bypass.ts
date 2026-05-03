/**
 * Must match `burrow-api/src/auth/data/demo-bypass.ts` (showcase signup; no email in bypass mode).
 */
export const DEMO_STATIC_OTP = '347612';

const DEMO_SIGNUP_EMAILS = new Set([
  'pushpander@alt-mobility.com',
  'prince@alt-mobility.com',
]);

export function isDemoBypassSignupEmail(email: string): boolean {
  return DEMO_SIGNUP_EMAILS.has(email.trim().toLowerCase());
}
