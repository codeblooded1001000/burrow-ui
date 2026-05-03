'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import type { MessageDto, MessagesPageResponse } from '@/lib/messaging/types';
import {
  conversationDetailQueryKey,
  messagesInfiniteQueryKey,
  receivedRequestsCountQueryKey,
  sentRequestsQueryKey,
  unreadCountQueryKey,
} from '@/lib/messaging/query-keys';
import { parseMessageFromSseData } from '@/lib/sse/sse-types';
import { sseClient } from '@/lib/sse/sse-client';
import { useMessagingUiStore } from '@/stores/messaging-ui-store';
import { toast } from '@/components/ui/Toast';

function appendIncomingMessage(qc: QueryClient, conversationId: string, msg: MessageDto): void {
  qc.setQueryData<InfiniteData<MessagesPageResponse>>(messagesInfiniteQueryKey(conversationId), (old) => {
    if (!old?.pages?.length) return old;
    const [first, ...rest] = old.pages;
    if (first.items.some((m) => m.id === msg.id)) return old;
    return {
      ...old,
      pages: [{ ...first, items: [msg, ...first.items] }, ...rest],
    };
  });
}

function parseConversationIdFromNumberShare(data: Record<string, unknown>): string | null {
  return typeof data.conversationId === 'string' ? data.conversationId : null;
}

export function SseProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const router = useRouter();
  const { user } = useCurrentUser();

  useEffect(() => {
    if (!user) {
      sseClient.disconnect();
      return;
    }

    sseClient.connect();

    const onUnload = () => {
      sseClient.disconnect();
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      sseClient.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const offNew = sseClient.on('message_new', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const conversationId = o.conversationId;
      const data = o.data;
      if (typeof conversationId !== 'string' || !data || typeof data !== 'object') return;
      const msg = parseMessageFromSseData(data as Record<string, unknown>);
      if (!msg) return;

      const active = useMessagingUiStore.getState().activeThreadId;
      if (active === conversationId) {
        appendIncomingMessage(qc, conversationId, msg);
      } else {
        void qc.invalidateQueries({ queryKey: messagesInfiniteQueryKey(conversationId) });
      }

      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
    });

    const offRead = sseClient.on('message_read', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const data = o.data;
      const conversationId =
        data && typeof data === 'object' && typeof (data as Record<string, unknown>).conversationId === 'string'
          ? (data as Record<string, unknown>).conversationId
          : null;
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      if (typeof conversationId === 'string') {
        void qc.invalidateQueries({ queryKey: messagesInfiniteQueryKey(conversationId) });
        void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(conversationId) });
      }
    });

    const offConv = sseClient.on('conversation_updated', () => {
      void qc.invalidateQueries({ queryKey: ['conversations'] });
    });

    const offNsReq = sseClient.on('number_share_requested', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const data = o.data;
      if (!data || typeof data !== 'object') return;
      const cid = parseConversationIdFromNumberShare(data as Record<string, unknown>);
      if (!cid) return;
      void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(cid) });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      toast('Someone wants to share phone numbers in a conversation.', {
        action: {
          label: 'Review',
          onClick: () => {
            useMessagingUiStore.getState().setOpenNumberShareConfirmForConversationId(cid);
            router.push(`/inbox/${cid}`);
          },
        },
      });
    });

    const offNsResp = sseClient.on('number_share_responded', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const data = o.data;
      if (!data || typeof data !== 'object') return;
      const status = (data as Record<string, unknown>).status;
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      if (status === 'ACCEPTED') {
        toast.success('Numbers shared.');
      } else if (status === 'DECLINED') {
        toast('Number share declined.');
      }
    });

    const offReqReceived = sseClient.on('request_received', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      void qc.invalidateQueries({ queryKey: receivedRequestsCountQueryKey });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      toast('New request to start a conversation.', {
        action: {
          label: 'Requests',
          onClick: () => {
            router.push('/inbox?tab=requests');
          },
        },
      });
    });

    const offReqAccepted = sseClient.on('request_accepted', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const cid = typeof o.conversationId === 'string' ? o.conversationId : null;
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
      if (cid) void qc.invalidateQueries({ queryKey: conversationDetailQueryKey(cid) });
      toast.success('Your message request was accepted.');
    });

    const offReqRejected = sseClient.on('request_rejected', (raw) => {
      if (!raw || typeof raw !== 'object') return;
      const o = raw as Record<string, unknown>;
      const cid = typeof o.conversationId === 'string' ? o.conversationId : null;
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: sentRequestsQueryKey });
      const active = useMessagingUiStore.getState().activeThreadId;
      if (cid && active === cid) {
        router.replace('/inbox');
      }
      toast('They declined your request.');
    });

    return () => {
      offNew();
      offRead();
      offConv();
      offNsReq();
      offNsResp();
      offReqReceived();
      offReqAccepted();
      offReqRejected();
    };
  }, [qc, router, user]);

  return <>{children}</>;
}
