'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { ListingPhotoCarousel } from '@/components/listings/ListingPhotoCarousel';
import { ListingMapPreview } from '@/components/listings/ListingMapPreview';
import { SendMessageModal } from '@/components/messaging/SendMessageModal';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { toast } from '@/components/ui/Toast';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { ApiError } from '@/lib/api/client';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { BlockConfirmModal } from '@/components/safety/BlockConfirmModal';
import { buildLookingForBlurb } from '@/lib/browse/listing-looking-for';
import { useBlockMutation } from '@/lib/hooks/use-safety';
import { useConversationLookupQuery } from '@/lib/hooks/messaging';
import { ListingCommuteBlock } from '@/components/listings/ListingCommuteBlock';
import { useListingDetailQuery } from '@/lib/hooks/use-listing-detail';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user } = useCurrentUser();
  const { data: listing, isLoading, error } = useListingDetailQuery(id);
  const lookup = useConversationLookupQuery(listing?.userId);
  const [msgOpen, setMsgOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const blockMut = useBlockMutation();

  const backButtonClass =
    'absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-full bg-dark-bg/55 p-2 text-cream shadow-md backdrop-blur-sm transition-colors hover:bg-dark-bg/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 dark:bg-dark-bg/70 dark:hover:bg-dark-bg/85 dark:focus-visible:ring-dark-teal/40';

  if (isLoading) {
    return (
      <div className="relative animate-pulse space-y-4 px-4 py-6">
        <button type="button" className={backButtonClass} aria-label="Back" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="h-[320px] rounded-xl bg-border dark:bg-dark-border" />
        <div className="h-8 w-2/3 rounded bg-border dark:bg-dark-border" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="px-4 py-10">
        <button
          type="button"
          className="mb-4 rounded-full p-2 text-ink-primary hover:bg-teal-tint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint/25 dark:focus-visible:ring-dark-teal/35"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          {error instanceof ApiError ? error.message : 'Listing not found.'}
        </p>
        <Button type="button" variant="tertiary" className="mt-4" onClick={() => router.push('/browse')}>
          Back to browse
        </Button>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`;
  const listerUserId = listing.userId;
  const isSelf = user?.id === listerUserId;
  const existingConversationId =
    lookup.isSuccess && lookup.data?.conversationId ? lookup.data.conversationId : null;

  return (
    <div className="pb-28">
      <div className="relative">
        <button type="button" className={backButtonClass} aria-label="Back" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <ListingPhotoCarousel photos={listing.photos} />
      </div>
      <div className="px-4 pt-4">
        <Heading as="h1" size={22}>
          ₹{listing.yourShare.toLocaleString('en-IN')}/mo · {listing.bhk} BHK in {listing.localityName}
        </Heading>
        <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          Posted by {listing.lister.fullName}, {listing.lister.age}
          {listing.lister.companyVerified ? (
            <span className="ml-2 inline-flex align-middle">
              <VerifiedBadge size={14} companyName={listing.lister.companyName} />
            </span>
          ) : null}
        </p>
        <section className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">About this flat</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{listing.description}</p>
        </section>
        <section className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Amenities</h2>
          <p className="mt-2 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            {listing.amenities.length ? listing.amenities.join(', ') : '—'}
          </p>
        </section>
        <section className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Looking for</h2>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{buildLookingForBlurb(listing)}</p>
        </section>
        {user && !isSelf ? <ListingCommuteBlock listingId={listing.id} /> : null}
        <section className="mt-8">
          <h2 className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Location</h2>
          <div className="mt-3">
            <ListingMapPreview lat={listing.lat} lng={listing.lng} />
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-sans text-sm font-medium text-teal underline dark:text-dark-teal"
          >
            Get directions
          </a>
        </section>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 mx-auto flex max-w-[390px] items-center gap-2 border-t border-border bg-cream/95 px-4 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
        {!isSelf ? (
          existingConversationId ? (
            <Button as={Link} href={`/inbox/${existingConversationId}` as Route} variant="primary" className="flex-1">
              Continue conversation
            </Button>
          ) : (
            <Button type="button" variant="primary" className="flex-1" onClick={() => setMsgOpen(true)}>
              Send message
            </Button>
          )
        ) : (
          <div className="flex-1" aria-hidden />
        )}
        <div className="relative">
          {!isSelf ? (
            <button
              type="button"
              aria-label="More actions"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border dark:border-dark-border"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-5 w-5 text-ink-primary dark:text-dark-ink-primary" strokeWidth={1.75} />
            </button>
          ) : null}
          {menuOpen && !isSelf ? (
            <div className="absolute bottom-full right-0 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg dark:border-dark-border dark:bg-dark-surface">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left font-sans text-sm text-ink-primary hover:bg-teal-tint dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint"
                onClick={() => {
                  setMenuOpen(false);
                  setBlockOpen(true);
                }}
              >
                Block
              </button>
              <Link
                href={`/report/${listerUserId}`}
                className="block px-3 py-2 font-sans text-sm text-ink-primary hover:bg-teal-tint dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint"
                onClick={() => setMenuOpen(false)}
              >
                Report
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <SendMessageModal
        open={msgOpen}
        onOpenChange={setMsgOpen}
        recipientUserId={listerUserId}
        recipientName={listing.lister.fullName}
      />

      <BlockConfirmModal
        user={{ id: listerUserId, fullName: listing.lister.fullName }}
        open={blockOpen}
        onOpenChange={setBlockOpen}
        onConfirm={async () => {
          try {
            await blockMut.mutateAsync({ userId: listerUserId });
            toast.success('Blocked');
            setBlockOpen(false);
            router.back();
          } catch (e) {
            if (e instanceof ApiError && e.status === 404) {
              toast.error('Blocking is not available on this server yet.');
              return;
            }
            toast.error(friendlyMessageForError(e));
          }
        }}
      />
    </div>
  );
}
