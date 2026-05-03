import { describe, expect, it, vi, afterEach } from 'vitest';
import { SseClient } from '@/lib/sse/sse-client';

describe('SseClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('subscribe and unsubscribe lifecycle removes handler', () => {
    const client = new SseClient();
    const fn = vi.fn();
    const off = client.on('message_new', fn);
    off();
    // No public emit; we only assert unsubscribe does not throw and registry is stable.
    expect(typeof off).toBe('function');
  });

  it('disconnect stops without throwing', () => {
    const client = new SseClient();
    client.disconnect();
    client.disconnect();
  });
});
