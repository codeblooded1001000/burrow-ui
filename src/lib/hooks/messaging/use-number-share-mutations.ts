'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { NumberShareRequestResponse, NumberShareRespondBody, NumberShareRespondResponse } from '@/lib/messaging/types';
import { conversationDetailQueryKey, unreadCountQueryKey } from '@/lib/messaging/query-keys';

export function useRequestNumberShareMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.post<NumberShareRequestResponse>(`/conversations/${conversationId}/number-share/request`, {}),
    onSuccess: (_data, conversationId) => {
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(conversationId) });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });
}

export function useRespondNumberShareMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: NumberShareRespondBody }) =>
      apiClient.post<NumberShareRespondResponse>(`/conversations/${conversationId}/number-share/respond`, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(vars.conversationId) });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });
}
