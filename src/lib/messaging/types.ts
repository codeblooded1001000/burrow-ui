/** Mirrors burrow-api `messaging.service.ts` DTOs + API_CONTRACT.md. */

export type MessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

/** Optimistic row appended before server ack. */
export type OptimisticMessageDto = MessageDto & {
  optimisticState?: 'sending' | 'failed';
  clientNonce?: string;
};

export type NumberShareRequestDto = {
  id: string;
  conversationId: string;
  requestedByUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  respondedAt: string | null;
};

export type ConversationParticipantSnippetDto = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  companyName: string;
  companyVerified: boolean;
};

export type ConversationStatusDto = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';

export type ConversationSummaryDto = {
  id: string;
  createdAt: string;
  lastMessageAt: string | null;
  numbersShared: boolean;
  status: ConversationStatusDto;
  initiatedByUserId: string;
  acceptedAt: string | null;
  otherParticipant: ConversationParticipantSnippetDto;
  lastMessage: MessageDto | null;
  unreadCount: number;
  pendingNumberShareRequest?: NumberShareRequestDto;
  myPhoneNumber?: string | null;
  otherPhoneNumber?: string | null;
};

export type ConversationsPageResponse = {
  items: ConversationSummaryDto[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type MessagesPageResponse = {
  items: (MessageDto | OptimisticMessageDto)[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type CreateConversationResponse = {
  conversation: ConversationSummaryDto;
  message: MessageDto;
};

export type SendMessageResponse = {
  message: MessageDto;
};

export type MarkReadResponse = {
  markedRead: number;
};

export type NumberShareRequestResponse = {
  request: NumberShareRequestDto;
};

export type NumberShareRespondBody = {
  requestId: string;
  accept: boolean;
};

export type NumberShareRespondResponse = {
  request: NumberShareRequestDto;
  phoneNumbers?: { requesterPhone: string | null; responderPhone: string | null };
};

export type UnreadCountResponse = {
  count: number;
};
