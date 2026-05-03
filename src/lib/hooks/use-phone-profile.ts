'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { OkEmptyResponse, PhonePatchResponse } from '@/lib/api/types';
import { authMeQueryKey, profileMeQueryKey } from '@/lib/api/query-keys';

export function usePatchUserPhoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { phoneNumber: string }) => apiClient.patch<PhonePatchResponse>('/users/me/phone', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: profileMeQueryKey });
    },
  });
}

export function useVerifyUserPhoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { otp: string }) => apiClient.post<OkEmptyResponse>('/users/me/phone/verify', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
      void qc.invalidateQueries({ queryKey: profileMeQueryKey });
    },
  });
}
