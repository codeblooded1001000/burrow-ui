'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { ListingPreviewCard } from '@/components/listings/ListingPreviewCard';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Modal } from '@/components/ui/Modal';
import { Subhead } from '@/components/ui/Subhead';
import { ApiError } from '@/lib/api/client';
import { friendlyMessageForCode, friendlyMessageForError } from '@/lib/api/error-messages';
import { buildListingCreateBody } from '@/lib/listing/build-listing-create-body';
import { withListingEdit } from '@/lib/listing/listing-edit-query';
import { useCreateListingMutation, useDeactivateListingMutation, useUpdateListingMutation } from '@/lib/hooks/use-listings';
import { useListingDraftStore } from '@/stores/listing-draft-store';

export default function ListingReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const draft = useListingDraftStore();
  const reset = useListingDraftStore((s) => s.reset);
  const create = useCreateListingMutation();
  const update = useUpdateListingMutation();
  const deactivate = useDeactivateListingMutation();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePending, setDeactivatePending] = useState(false);

  const saveMutation = isEdit ? update : create;
  const isPending = saveMutation.isPending;

  const onPublish = async () => {
    try {
      const body = buildListingCreateBody(draft);
      if (isEdit) {
        await update.mutateAsync(body);
        reset();
        toast.success('Listing updated.');
        router.push('/account');
        return;
      }
      await create.mutateAsync(body);
      reset();
      toast.success('Your listing is live.');
      router.push('/browse');
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'CONFLICT' || e.code === 'LISTING_ALREADY_EXISTS' || e.status === 409)) {
        toast.error(friendlyMessageForCode('LISTING_ALREADY_EXISTS'));
        router.push('/listing/edit');
        return;
      }
      toast.error(friendlyMessageForError(e));
    }
  };

  const onDeactivate = async () => {
    setDeactivatePending(true);
    try {
      await deactivate.mutateAsync();
      reset();
      toast.success('Listing deactivated.');
      setDeactivateOpen(false);
      router.push('/account');
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    } finally {
      setDeactivatePending(false);
    }
  };

  return (
    <>
      <PhoneShell
        progress={100}
        back
        onBack={() => router.push(withListingEdit('/listing/new/looking-for', isEdit))}
      >
        <div className="mt-6 flex flex-col gap-3">
          <Heading size={28}>{isEdit ? 'Review changes' : 'Looks good?'}</Heading>
          <Subhead>{isEdit ? 'Update how flatmates see your listing.' : 'This is how flatmates will see your listing.'}</Subhead>
        </div>
        <div className="mt-8">
          <ListingPreviewCard
            localityName={draft.localityName}
            bhk={draft.bhk}
            totalRent={draft.totalRent}
            yourShare={draft.yourShare}
            description={draft.description}
            photos={draft.photos}
            amenities={draft.amenities}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3">
          <Button type="button" variant="primary" loading={isPending} onClick={() => void onPublish()}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
          <Button type="button" variant="tertiary" onClick={() => router.push(withListingEdit('/listing/new/basics', isEdit))}>
            Edit
          </Button>
          {isEdit ? (
            <Button type="button" variant="secondary" className="mt-2 border-terracotta text-terracotta dark:border-dark-terracotta dark:text-dark-terracotta" onClick={() => setDeactivateOpen(true)}>
              Deactivate listing
            </Button>
          ) : null}
        </div>
      </PhoneShell>

      <Modal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate listing?"
        description="Your listing will be hidden from browse. You can create a new one later from your account."
        footer={
          <>
            <Button
              type="button"
              variant="primary"
              loading={deactivatePending}
              className="bg-terracotta text-cream hover:bg-terracotta/90 dark:bg-dark-terracotta dark:text-dark-bg dark:hover:bg-dark-terracotta/90"
              onClick={() => void onDeactivate()}
            >
              Deactivate
            </Button>
            <Button type="button" variant="secondary" disabled={deactivatePending} onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
          </>
        }
      />
    </>
  );
}
