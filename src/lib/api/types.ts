/** Mirrors `UserDto` in `API_CONTRACT.md` (burrow-api). */
export type UserDto = {
  id: string;
  email: string;
  role: 'LISTER' | 'SEEKER' | 'BOTH' | null;
  companyName: string;
  companyVerified: boolean;
  hasProfile: boolean;
  hasListing: boolean;
  profileCompletion: number;
  createdAt: string;
  fullName: string | null;
  photoUrl: string | null;
};

export type AuthMeResponse = {
  user: UserDto;
};

export type OkExpiresResponse = {
  ok: true;
  expiresAt: string;
  resendAvailableAt: string;
};

export type SignupVerifyOtpResponse = {
  ok: true;
  signupToken: string;
  expiresAt: string;
};

export type OkUserResponse = {
  ok: true;
  user: UserDto;
};

export type OkMessageResponse = {
  ok: true;
  message: string;
};

export type OkEmptyResponse = {
  ok: true;
};

export type PatchRoleResponse = {
  ok: true;
  user: UserDto;
};

export type PhoneVerifyResponse = {
  ok: true;
  recoveryToken: string;
  expiresAt: string;
};

export type PhonePatchResponse = { ok: true; expiresAt: string };
