'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConversationSummaryDto } from '@/lib/messaging/types';
import { sentRequestsQueryKey } from '@/lib/messaging/query-keys';
import { useSseStore } from '@/stores/sse-store';

type SentRequestsResponse = {
  items: ConversationSummaryDto[];
};

export function useSentRequestsQuery() {
  const sseConnected = useSseStore((s) => s.connected);
  return useQuery({
    queryKey: sentRequestsQueryKey,
    queryFn: () => apiClient.get<SentRequestsResponse>('/conversations/sent-requests'),
    refetchInterval: sseConnected ? false : 8000,
  });
}
