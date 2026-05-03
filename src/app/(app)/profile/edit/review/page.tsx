'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/Toast';
import { ProfilePreviewCard } from '@/components/profile/ProfilePreviewCard';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Subhead } from '@/components/ui/Subhead';
import { fetchCurrentUser } from '@/lib/api/client';
import type { AuthMeResponse } from '@/lib/api/types';
import { authMeQueryKey } from '@/lib/api/query-keys';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { buildFullProfilePut } from '@/lib/profile/build-full-profile-put';
import { resolveMediaRefToPublicUrl } from '@/lib/uploads/resolve-media-public-url';
import { usePatchProfileMutation, useUpdateProfileMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { useGetMyProfileQuery } from '@/lib/hooks/use-profiles';
import { useProfileDraftStore } from '@/stores/profile-draft-store';
import { withFromAccount } from '@/lib/profile/profile-edit-from-account';

export default function ProfileReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAccount = searchParams.get('from') === 'account';
  const qc = useQueryClient();
  const draft = useProfileDraftStore();
  const reset = useProfileDraftStore((s) => s.reset);
  const { data: profile } = useGetMyProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const patchProfile = usePatchProfileMutation();
  const mut = fromAccount ? patchProfile : updateProfile;

  if (!profile) {
    return (
      <PhoneShell
        progress={100}
        back
        onBack={() => router.push(withFromAccount('/profile/edit/preferences', fromAccount))}
      >
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  const body = buildFullProfilePut(profile, draft);
  const previewPhotoSrc =
    draft.pendingPhotoKey != null && draft.pendingPhotoKey.trim().length > 0
      ? resolveMediaRefToPublicUrl(draft.pendingPhotoKey)
      : profile.photoUrl;

  const onSave = async () => {
    try {
      if (fromAccount) {
        await patchProfile.mutateAsync(body);
      } else {
        await updateProfile.mutateAsync(body);
      }
      await qc.fetchQuery({
        queryKey: authMeQueryKey,
        queryFn: async () => {
          try {
            return await fetchCurrentUser();
          } catch {
            return null;
          }
        },
      });
      const me = qc.getQueryData(authMeQueryKey) as AuthMeResponse | null | undefined;
      reset();
      toast.success(fromAccount ? 'Profile updated' : 'Profile saved.');
      if (fromAccount) {
        router.push('/account');
        return;
      }
      const role = me?.user.role;
      if (role === 'SEEKER') {
        router.push('/browse');
      } else if (role === 'BOTH') {
        router.push('/listing/new/intro');
      } else {
        router.push('/browse');
      }
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  };

  return (
    <PhoneShell
      progress={100}
      back
      onBack={() => router.push(withFromAccount('/profile/edit/preferences', fromAccount))}
    >
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>{fromAccount ? 'Review changes' : 'Review your profile'}</Heading>
        <Subhead>{fromAccount ? 'Save when you are ready.' : 'This is how you will show up to flatmates.'}</Subhead>
      </div>
      <div className="mt-8">
        <ProfilePreviewCard
          photoUrl={previewPhotoSrc}
          fullName={profile.fullName}
          bio={draft.bio}
          profession={draft.profession}
          localities={draft.preferredLocalities}
          budgetMin={draft.budgetMin}
          budgetMax={draft.budgetMax}
          tags={draft.lifestyleTags}
        />
      </div>
      <div className="mt-10 flex flex-col gap-3">
        <Button type="button" variant="primary" loading={mut.isPending} onClick={() => void onSave()}>
          {fromAccount ? 'Save changes' : 'Save profile'}
        </Button>
        <Button type="button" variant="tertiary" onClick={() => router.push(withFromAccount('/profile/edit/about', fromAccount))}>
          Edit
        </Button>
      </div>
    </PhoneShell>
  );
}
