import type { ConversationTabParam } from '@/lib/messaging/conversation-tab';
import type { ConversationSummaryDto } from '@/lib/messaging/types';

export function conversationsInfiniteQueryKey(tab: ConversationTabParam = 'active') {
  return ['conversations', 'list', tab] as const;
}

export const sentRequestsQueryKey = ['conversations', 'sent-requests'] as const;

export const receivedRequestsCountQueryKey = ['conversations', 'requests-count'] as const;

export function conversationDetailQueryKey(conversationId: string) {
  return ['conversations', 'detail', conversationId] as const;
}

export function conversationLookupQueryKey(otherUserId: string) {
  return ['conversations', 'lookup', otherUserId] as const;
}

export function messagesInfiniteQueryKey(conversationId: string) {
  return ['conversations', conversationId, 'messages'] as const;
}

export const unreadCountQueryKey = ['messages', 'unread-count'] as const;

export function isMessageDto(x: unknown): x is import('@/lib/messaging/types').MessageDto {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.conversationId === 'string' && typeof o.senderId === 'string';
}

export function parseCreateConversationResponse(body: unknown): { conversation: ConversationSummaryDto; conversationId: string } | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const conv = o.conversation;
  if (!conv || typeof conv !== 'object') return null;
  const c = conv as Record<string, unknown>;
  if (typeof c.id !== 'string') return null;
  return { conversation: conv as ConversationSummaryDto, conversationId: c.id };
}
