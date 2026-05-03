'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { authMeQueryKey } from '@/lib/api/query-keys';
import type { AuthMeResponse } from '@/lib/api/types';
import type { MessageDto, MessagesPageResponse, OptimisticMessageDto, SendMessageResponse } from '@/lib/messaging/types';
import {
  conversationDetailQueryKey,
  messagesInfiniteQueryKey,
  receivedRequestsCountQueryKey,
  sentRequestsQueryKey,
  unreadCountQueryKey,
} from '@/lib/messaging/query-keys';

type SendVars = {
  conversationId: string;
  body: string;
  /** When retrying after failure, remove this temp row first. */
  replaceTempId?: string;
};

export function useSendMessageMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, body }: SendVars) =>
      apiClient.post<SendMessageResponse>(`/conversations/${conversationId}/messages`, { body }),

    onMutate: async (vars) => {
      const { conversationId, body, replaceTempId } = vars;
      await qc.cancelQueries({ queryKey: messagesInfiniteQueryKey(conversationId) });

      const me = qc.getQueryData<AuthMeResponse>(authMeQueryKey);
      const senderId = me?.user?.id ?? '';

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: OptimisticMessageDto = {
        id: tempId,
        conversationId,
        senderId,
        body,
        createdAt: new Date().toISOString(),
        readAt: null,
        optimisticState: 'sending',
        clientNonce: tempId,
      };

      qc.setQueryData<InfiniteData<MessagesPageResponse>>(messagesInfiniteQueryKey(conversationId), (old) => {
        if (!old?.pages?.length) {
          return {
            pageParams: [null],
            pages: [{ items: [optimistic], nextCursor: null, hasMore: false }],
          };
        }
        const [first, ...rest] = old.pages;
        const filteredFirst = replaceTempId
          ? { ...first, items: first.items.filter((m) => m.id !== replaceTempId) }
          : first;
        return {
          ...old,
          pages: [{ ...filteredFirst, items: [optimistic, ...filteredFirst.items] }, ...rest],
        };
      });

      return { tempId, conversationId };
    },

    onError: (_err, vars, ctx) => {
      if (!ctx?.tempId) return;
      qc.setQueryData<InfiniteData<MessagesPageResponse>>(messagesInfiniteQueryKey(vars.conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...first,
              items: first.items.map((m) =>
                m.id === ctx.tempId ? { ...m, optimisticState: 'failed' as const } : m,
              ),
            },
            ...rest,
          ],
        };
      });
    },

    onSuccess: (data, vars, ctx) => {
      if (!ctx?.tempId) return;
      const real: MessageDto = data.message;
      qc.setQueryData<InfiniteData<MessagesPageResponse>>(messagesInfiniteQueryKey(vars.conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...first,
              items: first.items.map((m) => (m.id === ctx.tempId ? real : m)),
            },
            ...rest,
          ],
        };
      });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(vars.conversationId) });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
    },
  });
}
