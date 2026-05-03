'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConversationSummaryDto } from '@/lib/messaging/types';
import { conversationDetailQueryKey } from '@/lib/messaging/query-keys';

export function useConversationQuery(conversationId: string) {
  return useQuery({
    queryKey: conversationDetailQueryKey(conversationId),
    queryFn: () => apiClient.get<ConversationSummaryDto>(`/conversations/${conversationId}`),
    enabled: Boolean(conversationId),
  });
}
