import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationListItem } from '@/components/messaging/conversation-list-item';
import type { ConversationSummaryDto } from '@/lib/messaging/types';

const conv: ConversationSummaryDto = {
  id: 'conv-1',
  createdAt: '2026-05-01T10:00:00.000Z',
  lastMessageAt: '2026-05-02T12:00:00.000Z',
  numbersShared: false,
  status: 'ACTIVE',
  initiatedByUserId: 'u-me',
  acceptedAt: '2026-05-01T10:00:00.000Z',
  otherParticipant: {
    id: 'u-other',
    fullName: 'Rahul Verma',
    photoUrl: null,
    companyName: 'Deloitte',
    companyVerified: true,
  },
  lastMessage: {
    id: 'm1',
    conversationId: 'conv-1',
    senderId: 'u-other',
    body: 'Hey there',
    createdAt: '2026-05-02T12:00:00.000Z',
    readAt: null,
  },
  unreadCount: 2,
};

describe('ConversationListItem', () => {
  it('shows name, preview, and unread dot when unreadCount > 0', () => {
    render(<ConversationListItem conversation={conv} />);
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    expect(screen.getByText('Hey there')).toBeInTheDocument();
    expect(screen.getByLabelText('Unread')).toBeInTheDocument();
  });

  it('shows verified badge when company is verified', () => {
    const { container } = render(<ConversationListItem conversation={conv} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
