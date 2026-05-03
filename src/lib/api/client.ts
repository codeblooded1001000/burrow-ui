import type { AuthMeResponse } from './types';

export type RequestOptions = Omit<RequestInit, 'body'> & {
  /** When false, skip JSON parse (e.g. blob responses). */
  parseJson?: boolean;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
  return url.replace(/\/$/, '');
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let code = 'UNKNOWN';
  let message = 'Something went wrong.';
  let details: unknown;

  try {
    const data = (await res.json()) as ApiErrorBody;
    if (data.error?.code) code = data.error.code;
    if (data.error?.message) message = data.error.message;
    details = data.error?.details;
  } catch {
    message = res.statusText || message;
  }

  return new ApiError(res.status, code, message, details);
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getBaseUrl();
  }

  private async request<T>(
    method: string,
    path: string,
    opts?: RequestOptions & { body?: unknown },
  ): Promise<T> {
    const { body, parseJson = true, headers: initHeaders, ...rest } = opts ?? {};
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers = new Headers(initHeaders);
    if (body !== undefined && body !== null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let res: Response;
    try {
      res = await fetch(url, {
        ...rest,
        method,
        credentials: 'include',
        headers,
        body: body === undefined || body === null ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Check your connection.');
    }

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    if (res.status === 204 || !parseJson) {
      return undefined as T;
    }

    const text = await res.text();
    if (!text) {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(res.status, 'INVALID_RESPONSE', 'Invalid JSON from server.');
    }
  }

  get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, opts);
  }

  post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...opts, body });
  }

  patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, { ...opts, body });
  }

  put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...opts, body });
  }

  delete<T>(path: string, opts?: RequestOptions & { body?: unknown }): Promise<T> {
    return this.request<T>('DELETE', path, opts);
  }
}

export const apiClient = new ApiClient();

export async function fetchCurrentUser(): Promise<AuthMeResponse> {
  return apiClient.get<AuthMeResponse>('/auth/me');
}
