import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/messaging/message-bubble';

describe('MessageBubble', () => {
  const base = {
    id: '1',
    conversationId: 'c1',
    senderId: 'u1',
    body: 'Hello',
    createdAt: '2026-05-02T12:00:00.000Z',
    readAt: null,
  };

  it('renders own message with teal styling', () => {
    const { container } = render(<MessageBubble message={base} isOwn showMeta />);
    const bubble = container.querySelector('.bg-teal');
    expect(bubble).toBeTruthy();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders other message with surface styling', () => {
    const { container } = render(<MessageBubble message={base} isOwn={false} showMeta />);
    const bubble = container.querySelector('.border-border');
    expect(bubble).toBeTruthy();
  });
});
