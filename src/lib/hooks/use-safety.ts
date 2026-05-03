'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError, getBaseUrl } from '@/lib/api/client';
import type { PostReportBody, PostReportResponse, ReportsMineResponse, BlockListResponse } from '@/lib/api/safety-types';
import { authMeQueryKey, blocksQueryKey, reportsMineQueryKey } from '@/lib/api/query-keys';
import { unreadCountQueryKey } from '@/lib/messaging/query-keys';

export type BlockBody = { userId: string };

export function useBlockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BlockBody) =>
      apiClient.post<{ block: { id: string; blockedUserId: string; createdAt: string } }>('/blocks', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: blocksQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function useUnblockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<{ ok: true; wasBlocking: boolean }>(`/blocks/${userId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: blocksQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      void qc.invalidateQueries({ queryKey: authMeQueryKey });
    },
  });
}

export function useBlockedUsersQuery(enabled = true) {
  return useQuery({
    queryKey: blocksQueryKey,
    queryFn: () => apiClient.get<BlockListResponse>('/blocks'),
    enabled,
  });
}

export type PostReportResult = PostReportResponse & { httpStatus: number };

export function useReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PostReportBody): Promise<PostReportResult> => {
      const url = `${getBaseUrl()}/reports`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw await parseErrorFromResponse(res);
      }
      const data = (await res.json()) as PostReportResponse;
      return { ...data, httpStatus: res.status };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: blocksQueryKey });
      void qc.invalidateQueries({ queryKey: ['browse'] });
      void qc.invalidateQueries({ queryKey: reportsMineQueryKey });
      void qc.invalidateQueries({ queryKey: unreadCountQueryKey });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMyReportsQuery(enabled = true) {
  return useQuery({
    queryKey: reportsMineQueryKey,
    queryFn: () => apiClient.get<ReportsMineResponse>('/reports/mine'),
    enabled,
  });
}

export type DeleteAccountBody = { pin: string };

export function useDeleteAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeleteAccountBody) => apiClient.delete<{ ok: true }>('/users/me', { body }),
    onSuccess: () => {
      qc.clear();
    },
  });
}

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(header);
  return m?.[1]?.trim().replace(/^["']|["']$/g, '') ?? null;
}

export function useExportDataMutation() {
  return useMutation({
    mutationFn: async (): Promise<{ blob: Blob; filename: string }> => {
      const url = `${getBaseUrl()}/users/me/export`;
      const res = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!res.ok) {
        throw await parseErrorFromResponse(res);
      }
      const blob = await res.blob();
      const fromHeader = parseFilenameFromContentDisposition(res.headers.get('Content-Disposition'));
      const userId = 'me';
      const date = new Date().toISOString().slice(0, 10);
      const filename = fromHeader ?? `burrow-data-${userId}-${date}.json`;
      return { blob, filename };
    },
  });
}

async function parseErrorFromResponse(res: Response): Promise<ApiError> {
  let code = 'UNKNOWN';
  let message = 'Something went wrong.';
  try {
    const data = (await res.json()) as { error?: { code?: string; message?: string } };
    if (data.error?.code) code = data.error.code;
    if (data.error?.message) message = data.error.message;
  } catch {
    message = res.statusText || message;
  }
  return new ApiError(res.status, code, message);
}

/** TODO: Backend — implement PATCH /users/me/notification-prefs; until then this is a no-op success. */
export type NotificationPrefsBody = {
  newMessages?: boolean;
  newMatchesDigest?: boolean;
  weeklyDigest?: boolean;
  showLastActive?: boolean;
};

export function useUpdateNotificationPrefsMutation() {
  return useMutation({
    mutationFn: async (_body: NotificationPrefsBody) => {
      // Stub: real endpoint not shipped yet (F6 spec).
      await Promise.resolve();
      return { ok: true as const };
    },
  });
}
