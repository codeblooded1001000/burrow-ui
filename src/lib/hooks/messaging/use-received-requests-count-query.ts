'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConversationsPageResponse } from '@/lib/messaging/types';
import { receivedRequestsCountQueryKey } from '@/lib/messaging/query-keys';
import { useSseStore } from '@/stores/sse-store';

export function useReceivedRequestsCountQuery() {
  const sseConnected = useSseStore((s) => s.connected);
  return useQuery({
    queryKey: receivedRequestsCountQueryKey,
    queryFn: async () => {
      const r = await apiClient.get<ConversationsPageResponse>('/conversations?tab=requests&limit=50');
      return r.items.length;
    },
    refetchInterval: sseConnected ? false : 8000,
  });
}
