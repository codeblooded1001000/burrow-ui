'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiError, fetchCurrentUser } from '@/lib/api/client';
import { authMeQueryKey } from '@/lib/api/query-keys';
import type { AuthMeResponse, UserDto } from '@/lib/api/types';

export function useCurrentUser(): {
  data: AuthMeResponse | null | undefined;
  user: UserDto | undefined;
  isPending: boolean;
  isAuthenticated: boolean;
  error: ApiError | Error | null;
  refetch: () => void;
} {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: authMeQueryKey,
    queryFn: async (): Promise<AuthMeResponse | null> => {
      try {
        return await fetchCurrentUser();
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.code === 'UNAUTHENTICATED')) {
          return null;
        }
        throw e;
      }
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    user: data?.user,
    isPending,
    isAuthenticated: Boolean(data?.user),
    error: error ?? null,
    refetch: () => {
      void refetch();
    },
  };
}
