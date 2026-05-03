'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, List, Map as MapIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from '@/components/ui/Toast';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Subhead } from '@/components/ui/Subhead';
import { BrowseFilterSheet } from '@/components/browse/BrowseFilterSheet';
import { BrowseMapView } from '@/components/browse/BrowseMapView';
import { ListingCard } from '@/components/listings/ListingCard';
import { SeekerProfileCard } from '@/components/listings/SeekerProfileCard';
import { ApiError } from '@/lib/api/client';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { activeFilterChips, restrictiveFilterHints } from '@/lib/browse/active-filters';
import { useBrowseTabBootstrap } from '@/lib/browse/use-browse-tab-bootstrap';
import { useBrowseFlatsQuery, useBrowseFlatmatesQuery } from '@/lib/hooks/use-browse';
import { useGetConstantsQuery } from '@/lib/hooks/use-constants';
import { useBrowseStore } from '@/stores/browse-store';

export function BrowseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const tab = useBrowseStore((s) => s.tab);
  const setTab = useBrowseStore((s) => s.setTab);
  const view = useBrowseStore((s) => s.view);
  const setView = useBrowseStore((s) => s.setView);
  const filters = useBrowseStore((s) => s.filters);
  const setFilters = useBrowseStore((s) => s.setFilters);
  const clearFilters = useBrowseStore((s) => s.clearFilters);
  const { data: constants } = useGetConstantsQuery();
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(null);

  useBrowseTabBootstrap(user?.id, user?.role ?? null);

  const viewFromUrl = searchParams.get('view') === 'map' ? 'map' : 'list';
  useEffect(() => {
    setView(viewFromUrl);
  }, [viewFromUrl, setView]);

  useEffect(() => {
    if (tab === 'flatmates' && viewFromUrl === 'map') {
      router.replace('/browse', { scroll: false });
    }
  }, [tab, viewFromUrl, router]);

  const canFlats = user?.role === 'SEEKER' || user?.role === 'BOTH';
  const canFlatmates = user?.role === 'LISTER' || user?.role === 'BOTH';
  const needsListingForFlatmates =
    Boolean(user) && tab === 'flatmates' && canFlatmates && !user.hasListing;
  const canFetchFlatmates = tab === 'flatmates' && canFlatmates && Boolean(user?.hasListing);

  const flatsQuery = useBrowseFlatsQuery(tab === 'flats' && canFlats);
  const matesQuery = useBrowseFlatmatesQuery(canFetchFlatmates);

  const activeQuery = tab === 'flats' ? flatsQuery : matesQuery;

  const browseHasNextPage = tab === 'flats' ? flatsQuery.hasNextPage : matesQuery.hasNextPage;
  const browseIsFetchingNextPage = tab === 'flats' ? flatsQuery.isFetchingNextPage : matesQuery.isFetchingNextPage;
  const browseFetchNextPage = tab === 'flats' ? flatsQuery.fetchNextPage : matesQuery.fetchNextPage;

  useEffect(() => {
    const err = flatsQuery.error;
    if (!(err instanceof ApiError)) return;
    if (err.status === 403 && canFlatmates) {
      toast.error('Switching to Flatmates — you cannot browse flats as a lister-only account.');
      setTab('flatmates');
    }
  }, [flatsQuery.error, canFlatmates, setTab]);

  useEffect(() => {
    const err = matesQuery.error;
    if (!(err instanceof ApiError)) return;
    if (err.status === 403 && canFlats) {
      toast.error('Switching to Flats — you cannot browse flatmates as a seeker-only account.');
      setTab('flats');
    }
  }, [matesQuery.error, canFlats, setTab]);

  useEffect(() => {
    const err = activeQuery.error;
    if (err instanceof ApiError && err.status === 429) {
      toast.error(err.message || 'Slow down — try again later.');
    }
  }, [activeQuery.error]);

  const flatItems = useMemo(() => flatsQuery.data?.pages.flatMap((p) => p.items) ?? [], [flatsQuery.data]);
  const mateItems = useMemo(() => matesQuery.data?.pages.flatMap((p) => p.items) ?? [], [matesQuery.data]);
  const listingsForMap = useMemo(() => (tab === 'flats' ? flatItems : []), [tab, flatItems]);

  useEffect(() => {
    if (tab !== 'flats' || listingsForMap.length === 0) {
      setMapSelectedId(null);
      return;
    }
    setMapSelectedId((cur) => (cur && listingsForMap.some((l) => l.id === cur) ? cur : listingsForMap[0]?.id ?? null));
  }, [tab, listingsForMap]);

  const chips = useMemo(() => activeFilterChips(filters, (patch) => setFilters(patch)), [filters, setFilters]);

  const { ref: sentinelRef, inView } = useInView({ rootMargin: '240px' });

  useEffect(() => {
    if (!inView) return;
    if (browseHasNextPage && !browseIsFetchingNextPage) void browseFetchNextPage();
  }, [inView, browseHasNextPage, browseIsFetchingNextPage, browseFetchNextPage]);

  const setListUrl = useCallback(() => {
    router.replace('/browse', { scroll: false });
  }, [router]);

  const setMapUrl = useCallback(() => {
    router.replace('/browse?view=map', { scroll: false });
  }, [router]);

  const toggleView = () => {
    if (view === 'map') {
      setListUrl();
    } else {
      setMapUrl();
    }
  };

  const isLoading = needsListingForFlatmates ? false : activeQuery.isLoading;
  const isEmpty =
    !needsListingForFlatmates &&
    !isLoading &&
    activeQuery.isSuccess &&
    (tab === 'flats' ? flatItems.length === 0 : mateItems.length === 0);

  if (!constants) {
    return <p className="px-6 py-10 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-28 pt-4">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary dark:text-dark-ink-tertiary">
        Looking for
      </p>

      <div className="flex h-12 w-full overflow-hidden rounded-xl border border-border bg-surface dark:border-dark-border dark:bg-dark-surface">
        <button
          type="button"
          disabled={!canFlats}
          onClick={() => canFlats && setTab('flats')}
          className={`flex-1 font-sans text-sm font-medium transition-colors ${
            tab === 'flats'
              ? 'bg-teal text-cream dark:bg-dark-teal dark:text-dark-bg'
              : 'text-ink-secondary disabled:opacity-40 dark:text-dark-ink-secondary'
          }`}
        >
          Flats
        </button>
        <button
          type="button"
          disabled={!canFlatmates}
          onClick={() => canFlatmates && setTab('flatmates')}
          className={`flex-1 font-sans text-sm font-medium transition-colors ${
            tab === 'flatmates'
              ? 'bg-teal text-cream dark:bg-dark-teal dark:text-dark-bg'
              : 'text-ink-secondary disabled:opacity-40 dark:text-dark-ink-secondary'
          }`}
        >
          Flatmates
        </button>
      </div>

      {needsListingForFlatmates ? null : (
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal bg-teal-tint px-3 py-2 font-sans text-xs font-medium text-teal dark:border-dark-teal dark:bg-dark-teal-tint dark:text-dark-teal"
            >
              <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Filters
            </button>
            {chips.map((c) => (
              <Chip key={c.id} variant="filter" selected onRemove={c.onRemove}>
                {c.label}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            disabled={tab === 'flatmates'}
            onClick={toggleView}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-ink-primary hover:border-teal/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:text-dark-ink-primary dark:hover:border-dark-teal/40"
            aria-label={view === 'map' ? 'List view' : 'Map view'}
          >
            {view === 'map' ? <List className="h-5 w-5" strokeWidth={1.75} /> : <MapIcon className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      )}

      {activeQuery.isError && !(activeQuery.error instanceof ApiError && (activeQuery.error.status === 403)) ? (
        <p className="font-sans text-sm text-terracotta dark:text-dark-terracotta">Could not load results. Pull to retry or adjust filters.</p>
      ) : null}

      {needsListingForFlatmates ? (
        <BrowseFlatmatesNoListingCta />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isEmpty ? (
        <BrowseEmptyBody filters={filters} onPatch={setFilters} onResetAll={clearFilters} />
      ) : view === 'map' && tab === 'flats' ? (
        <BrowseMapView listings={listingsForMap} selectedId={mapSelectedId} onSelect={setMapSelectedId} />
      ) : (
        <div className="flex flex-col gap-3">
          {tab === 'flats'
            ? flatItems.map((l) => <ListingCard key={l.id} listing={l} />)
            : mateItems.map((p) => <SeekerProfileCard key={p.id} profile={p} />)}
          {activeQuery.isFetchingNextPage ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : null}
          <div ref={sentinelRef} className="h-4 w-full shrink-0" aria-hidden />
        </div>
      )}

      <BrowseFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        tab={tab}
        constants={constants}
      />
    </div>
  );
}

function BrowseFlatmatesNoListingCta() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 dark:border-dark-border dark:bg-dark-surface">
      <Heading as="h2" size={22}>
        List your flat first
      </Heading>
      <Subhead>
        You do not have a listing yet. Add your place so seekers can find you — and so you can browse people looking for a flatmate here.
      </Subhead>
      <Button as={Link} href={'/listing/new/intro' as Route} variant="primary" className="w-full sm:w-auto">
        List my flat
      </Button>
      <p className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">
        Finished listing setup? Pull to refresh or revisit this tab — your profile will load flatmates once the listing is live.
      </p>
    </div>
  );
}

function BrowseEmptyBody({
  filters,
  onPatch,
  onResetAll,
}: {
  filters: ReturnType<typeof useBrowseStore.getState>['filters'];
  onPatch: (p: Partial<typeof filters>) => void;
  onResetAll: () => void;
}) {
  const hints = useMemo(() => restrictiveFilterHints(filters, onPatch), [filters, onPatch]);
  return (
    <div className="flex flex-col items-center py-6">
      <EmptyState
        title="No matches with these filters"
        description={hints.length ? 'Try removing one of these:' : 'Try widening your search or reset filters.'}
        actionLabel="Reset all filters"
        onAction={onResetAll}
      />
      {hints.length > 0 ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {hints.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={h.onRemove}
              className="rounded-full border border-teal bg-teal-tint px-3 py-1.5 font-sans text-xs font-medium text-teal dark:border-dark-teal dark:bg-dark-teal-tint dark:text-dark-teal"
            >
              {h.label} ✕
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
