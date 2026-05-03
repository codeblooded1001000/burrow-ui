'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MarkReadResponse } from '@/lib/messaging/types';
import {
  conversationDetailQueryKey,
  messagesInfiniteQueryKey,
  unreadCountQueryKey,
} from '@/lib/messaging/query-keys';

type MarkReadVars = { conversationId: string; upToMessageId?: string };

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, upToMessageId }: MarkReadVars) =>
      apiClient.patch<MarkReadResponse>(`/conversations/${conversationId}/messages/read`, {
        ...(upToMessageId ? { upToMessageId } : {}),
      }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(vars.conversationId) });
      void qc.invalidateQueries({ queryKey: messagesInfiniteQueryKey(vars.conversationId) });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
    },
  });
}
