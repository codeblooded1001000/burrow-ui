'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { authMeQueryKey } from '@/lib/api/query-keys';
import type {
  OkEmptyResponse,
  OkExpiresResponse,
  OkMessageResponse,
  OkUserResponse,
  PatchRoleResponse,
  PhoneVerifyResponse,
  SignupVerifyOtpResponse,
} from '@/lib/api/types';
import type { FullProfilePutBody } from '@/lib/profile/build-full-profile-put';
import type { ProfileOwnDto } from '@/lib/api/listing-types';
import type { ProfilePutPayload } from '@/lib/profile/build-onboarding-profile';
import { profileMeQueryKey } from '@/lib/api/query-keys';

export function useRequestOtpMutation() {
  return useMutation({
    mutationFn: (body: { email: string }) => apiClient.post<OkExpiresResponse>('/auth/signup/request-otp', body),
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (body: { email: string; otp: string }) =>
      apiClient.post<SignupVerifyOtpResponse>('/auth/signup/verify-otp', body),
  });
}

export function useSetPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { signupToken: string; pin: string; confirmPin: string }) =>
      apiClient.post<OkUserResponse>('/auth/signup/set-pin', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function useManualReviewMutation() {
  return useMutation({
    mutationFn: (body: { email: string; companyClaim: string }) =>
      apiClient.post<OkMessageResponse>('/auth/signup/manual-review', body),
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; pin: string }) => apiClient.post<OkUserResponse>('/auth/login', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<OkEmptyResponse>('/auth/logout', {}),
    onSuccess: () => {
      qc.setQueryData(authMeQueryKey, null);
    },
  });
}

export function useForgotPinMutation() {
  return useMutation({
    mutationFn: (body: { email: string }) => apiClient.post<OkExpiresResponse>('/auth/recover/request-otp', body),
  });
}

export function useResetPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; otp: string; newPin: string; confirmNewPin: string }) =>
      apiClient.post<OkUserResponse>('/auth/recover/verify-and-reset', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function usePhoneRecoveryMutation() {
  return useMutation({
    mutationFn: (body: { phoneNumber: string }) =>
      apiClient.post<OkExpiresResponse>('/auth/recover/phone-request-otp', body),
  });
}

export function usePhoneVerifyMutation() {
  return useMutation({
    mutationFn: (body: { phoneNumber: string; otp: string }) =>
      apiClient.post<PhoneVerifyResponse>('/auth/recover/phone-verify', body),
  });
}

export function usePhoneUpdateEmailMutation() {
  return useMutation({
    mutationFn: (body: { recoveryToken: string; newEmail: string }) =>
      apiClient.post<OkExpiresResponse>('/auth/recover/phone-update-email', body),
  });
}

export function useConfirmNewEmailMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { recoveryToken: string; newEmail: string; otp: string }) =>
      apiClient.post<OkMessageResponse>('/auth/recover/confirm-new-email', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { role: 'LISTER' | 'SEEKER' | 'BOTH' }) =>
      apiClient.patch<PatchRoleResponse>('/users/me/role', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
    },
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfilePutPayload | FullProfilePutBody) => apiClient.put<unknown>('/profiles/me', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: profileMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['maps'] });
    },
  });
}

export function usePatchProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<FullProfilePutBody>) => apiClient.patch<ProfileOwnDto>('/profiles/me', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: profileMeQueryKey });
      void qc.invalidateQueries({ queryKey: ['maps'] });
    },
  });
}
