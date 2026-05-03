'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  conversationDetailQueryKey,
  receivedRequestsCountQueryKey,
  sentRequestsQueryKey,
} from '@/lib/messaging/query-keys';

export type RejectRequestBody = {
  conversationId: string;
  reason?: string;
};

export function useRejectRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, reason }: RejectRequestBody) =>
      apiClient.post<{ ok: true }>(`/conversations/${conversationId}/reject`, { reason }),
    onSuccess: (_data, { conversationId }) => {
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(conversationId) });
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
    },
  });
}
