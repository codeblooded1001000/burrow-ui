'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConversationSummaryDto } from '@/lib/messaging/types';
import {
  conversationDetailQueryKey,
  receivedRequestsCountQueryKey,
  sentRequestsQueryKey,
} from '@/lib/messaging/query-keys';

type AcceptResponse = {
  conversation: ConversationSummaryDto;
};

export function useAcceptRequestMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      apiClient.post<AcceptResponse>(`/conversations/${conversationId}/accept`, {}),
    onSuccess: (_data, conversationId) => {
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(conversationId) });
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
    },
  });
}
