import type { MessageDto } from '@/lib/messaging/types';

export type MessagingSsePayload =
  | { type: 'message_new'; conversationId: string; data: Record<string, unknown> }
  | { type: 'message_read'; data: { conversationId: string; readerId: string } }
  | { type: 'number_share_requested'; data: Record<string, unknown> }
  | { type: 'number_share_responded'; data: { requestId: string; status: string } }
  | { type: 'conversation_updated'; data: { conversationId: string; lastMessageAt: string | null } }
  | { type: 'keepalive'; data: Record<string, unknown> };

export function parseMessageFromSseData(data: Record<string, unknown>): MessageDto | null {
  if (typeof data.id !== 'string' || typeof data.conversationId !== 'string' || typeof data.senderId !== 'string') {
    return null;
  }
  if (typeof data.body !== 'string' || typeof data.createdAt !== 'string') return null;
  return {
    id: data.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    body: data.body,
    createdAt: data.createdAt,
    readAt: typeof data.readAt === 'string' || data.readAt === null ? (data.readAt as string | null) : null,
  };
}
