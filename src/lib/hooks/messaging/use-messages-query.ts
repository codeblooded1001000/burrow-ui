'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MessagesPageResponse } from '@/lib/messaging/types';
import { messagesInfiniteQueryKey } from '@/lib/messaging/query-keys';

export function useMessagesQuery(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messagesInfiniteQueryKey(conversationId),
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const sp = new URLSearchParams();
      sp.set('limit', '50');
      if (pageParam) sp.set('cursor', pageParam);
      return apiClient.get<MessagesPageResponse>(`/conversations/${conversationId}/messages?${sp.toString()}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    enabled: Boolean(conversationId),
  });
}
