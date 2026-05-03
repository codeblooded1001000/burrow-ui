'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConversationTabParam } from '@/lib/messaging/conversation-tab';
import type { ConversationsPageResponse } from '@/lib/messaging/types';
import { conversationsInfiniteQueryKey } from '@/lib/messaging/query-keys';
import { useSseStore } from '@/stores/sse-store';

export function useConversationsQuery(tab: ConversationTabParam = 'active') {
  const sseConnected = useSseStore((s) => s.connected);

  return useInfiniteQuery({
    queryKey: conversationsInfiniteQueryKey(tab),
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const sp = new URLSearchParams();
      sp.set('tab', tab);
      sp.set('limit', '30');
      if (pageParam) sp.set('cursor', pageParam);
      return apiClient.get<ConversationsPageResponse>(`/conversations?${sp.toString()}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    refetchInterval: sseConnected ? false : 5000,
  });
}
