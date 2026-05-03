import { getBaseUrl } from '@/lib/api/client';
import { useSseStore } from '@/stores/sse-store';

type SseHandler = (data: unknown) => void;

function setConnectedGlobal(connected: boolean): void {
  useSseStore.getState().setConnected(connected);
}

/**
 * Parses `text/event-stream` chunks; each SSE event may include one or more `data:` lines.
 */
async function consumeSseStream(
  url: string,
  signal: AbortSignal,
  onPayload: (payload: unknown) => void,
): Promise<void> {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'text/event-stream' },
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`SSE ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const block of parts) {
      const lines = block.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const json = line.slice('data:'.length).trimStart();
        if (!json) continue;
        try {
          onPayload(JSON.parse(json) as unknown);
        } catch {
          // ignore malformed chunk
        }
      }
    }
  }
}

export class SseClient {
  private abort: AbortController | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private running = false;
  private readonly listeners = new Map<string, Set<SseHandler>>();

  connect(): void {
    this.stopped = false;
    if (this.running) return;
    void this.runForever();
  }

  disconnect(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.abort?.abort();
    this.abort = null;
    this.running = false;
    this.reconnectAttempt = 0;
    setConnectedGlobal(false);
  }

  on(eventType: string, handler: SseHandler): () => void {
    let set = this.listeners.get(eventType);
    if (!set) {
      set = new Set();
      this.listeners.set(eventType, set);
    }
    set.add(handler);
    return () => {
      set?.delete(handler);
      if (set && set.size === 0) this.listeners.delete(eventType);
    };
  }

  private emit(eventType: string, data: unknown): void {
    this.listeners.get(eventType)?.forEach((h) => {
      try {
        h(data);
      } catch {
        // isolate handler errors
      }
    });
  }

  private async runForever(): Promise<void> {
    if (this.running) return;
    this.running = true;
    const url = `${getBaseUrl()}/messages/stream`;

    while (!this.stopped) {
      this.abort = new AbortController();
      try {
        let firstInStream = true;
        await consumeSseStream(url, this.abort.signal, (payload) => {
          if (firstInStream) {
            firstInStream = false;
            this.reconnectAttempt = 0;
          }
          if (!payload || typeof payload !== 'object') return;
          const p = payload as Record<string, unknown>;
          const t = p.type;
          if (typeof t !== 'string') return;
          if (t === 'keepalive') {
            setConnectedGlobal(true);
            return;
          }
          setConnectedGlobal(true);
          this.emit(t, payload);
        });
      } catch {
        setConnectedGlobal(false);
      } finally {
        this.abort = null;
      }

      if (this.stopped) break;

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30_000);
      this.reconnectAttempt += 1;
      await new Promise<void>((resolve) => {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          resolve();
        }, delay);
      });
    }

    this.running = false;
    setConnectedGlobal(false);
  }
}

export const sseClient = new SseClient();
