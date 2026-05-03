'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/states/LoadingState';
import { ApiError } from '@/lib/api/client';
import { useGetMyListingQuery } from '@/lib/hooks/use-listings';
import { useListingDraftStore } from '@/stores/listing-draft-store';

export default function ListingEditEntryPage() {
  const router = useRouter();
  const { data, isPending, isError, error } = useGetMyListingQuery();
  const loadFromExisting = useListingDraftStore((s) => s.loadFromExisting);

  useEffect(() => {
    if (isPending) return;
    if (isError) {
      if (error instanceof ApiError && error.status === 404) {
        router.replace('/listing/new/intro');
        return;
      }
      return;
    }
    if (data) {
      loadFromExisting(data);
      router.replace('/listing/new/basics?edit=1');
    }
  }, [isPending, isError, error, data, loadFromExisting, router]);

  return <LoadingState message="Loading your listing…" />;
}
