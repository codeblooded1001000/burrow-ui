'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import type { UnreadCountResponse } from '@/lib/messaging/types';
import { unreadCountQueryKey } from '@/lib/messaging/query-keys';

export function useUnreadCountQuery() {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: () => apiClient.get<UnreadCountResponse>('/messages/unread-count'),
    enabled: Boolean(user),
    staleTime: 30_000,
  });
}
