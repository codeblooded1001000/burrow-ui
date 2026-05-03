/**
 * Keep aligned with `burrow-api/src/auth/schemas/auth.schemas.ts` and profile PUT rules.
 * Note in commit when backend schemas change.
 */
import { z } from 'zod';
import { MAX_AGE, MIN_AGE } from '@/lib/constants';

const emailField = z.string().email().transform((e) => e.trim().toLowerCase());

export const RequestOtpSchema = z.object({
  email: emailField,
});

export const VerifyOtpSchema = z.object({
  email: emailField,
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const SetPinSchema = z
  .object({
    signupToken: z.string().min(1),
    pin: z.string().length(6).regex(/^\d{6}$/),
    confirmPin: z.string().length(6).regex(/^\d{6}$/),
  })
  .refine((d) => d.pin === d.confirmPin, {
    message: "PINs don't match",
    path: ['confirmPin'],
  });

export const LoginSchema = z.object({
  email: emailField,
  pin: z.string().length(6).regex(/^\d{6}$/),
});

export const ManualReviewSchema = z.object({
  email: emailField,
  companyClaim: z.string().min(1).max(500),
});

export type ManualReviewInput = z.infer<typeof ManualReviewSchema>;

export const RecoverRequestOtpSchema = z.object({
  email: emailField,
});

export const RecoverVerifyResetSchema = z
  .object({
    email: emailField,
    otp: z.string().length(6).regex(/^\d{6}$/),
    newPin: z.string().length(6).regex(/^\d{6}$/),
    confirmNewPin: z.string().length(6).regex(/^\d{6}$/),
  })
  .refine((d) => d.newPin === d.confirmNewPin, {
    message: "PINs don't match",
    path: ['confirmNewPin'],
  });

export const GenderSchema = z.enum(['WOMAN', 'MAN', 'PREFER_NOT']);

export const BasicsSchema = z.object({
  fullName: z.string().min(1, 'Enter your full name').max(120),
  age: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE),
  gender: GenderSchema,
});

/** Form values for basics screen (Pill labels). Convert with `basicsFormToInput`. */
export const BasicsFormSchema = z.object({
  fullName: z.string().min(1, 'Enter your full name').max(120),
  age: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE),
  genderUi: z.enum(['Woman', 'Man', 'Prefer not to say']),
});

export type BasicsFormValues = z.infer<typeof BasicsFormSchema>;

export function basicsFormToInput(v: BasicsFormValues): BasicsInput {
  const gender: BasicsInput['gender'] =
    v.genderUi === 'Woman' ? 'WOMAN' : v.genderUi === 'Man' ? 'MAN' : 'PREFER_NOT';
  return { fullName: v.fullName, age: v.age, gender };
}

export const RoleSchema = z.object({
  role: z.enum(['LISTER', 'SEEKER', 'BOTH']),
});

export const PhoneRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, 'Use a valid Indian mobile number'),
});

export const PhoneVerifySchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const PhoneUpdateEmailSchema = z.object({
  recoveryToken: z.string().min(1),
  newEmail: emailField,
});

/** Standalone new-email field for phone recovery UI (same rules as `newEmail` in `PhoneUpdateEmailSchema`). */
export const RecoverNewEmailStepSchema = z.object({
  newEmail: emailField,
});

export type RecoverNewEmailStepInput = z.infer<typeof RecoverNewEmailStepSchema>;

export const ConfirmNewEmailSchema = z.object({
  recoveryToken: z.string().min(1),
  newEmail: emailField,
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export type ConfirmNewEmailInput = z.infer<typeof ConfirmNewEmailSchema>;

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;
export type RecoverRequestOtpInput = z.infer<typeof RecoverRequestOtpSchema>;
export type RecoverVerifyResetInput = z.infer<typeof RecoverVerifyResetSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type SetPinInput = z.infer<typeof SetPinSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type BasicsInput = z.infer<typeof BasicsSchema>;
export type RoleInput = z.infer<typeof RoleSchema>;
