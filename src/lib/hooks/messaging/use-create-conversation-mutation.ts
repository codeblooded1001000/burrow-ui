'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CreateConversationResponse } from '@/lib/messaging/types';
import {
  conversationLookupQueryKey,
  receivedRequestsCountQueryKey,
  sentRequestsQueryKey,
} from '@/lib/messaging/query-keys';

export type CreateConversationBody = {
  recipientUserId: string;
  initialMessage: string;
};

export function useCreateConversationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConversationBody) => apiClient.post<CreateConversationResponse>('/conversations', body),
    onSuccess: (_data, body) => {
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: conversationLookupQueryKey(body.recipientUserId) });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
    },
  });
}
