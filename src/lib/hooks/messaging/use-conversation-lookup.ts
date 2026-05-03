'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { conversationLookupQueryKey } from '@/lib/messaging/query-keys';

export type ConversationLookupResponse = {
  conversationId: string | null;
};

export function useConversationLookupQuery(otherUserId: string | undefined) {
  const { user } = useCurrentUser();
  const enabled = Boolean(otherUserId && user && otherUserId !== user.id);

  return useQuery({
    queryKey: otherUserId ? conversationLookupQueryKey(otherUserId) : ['conversations', 'lookup', ''],
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('otherUserId', otherUserId ?? '');
      return apiClient.get<ConversationLookupResponse>(`/conversations/lookup?${sp.toString()}`);
    },
    enabled,
    staleTime: 20_000,
  });
}
