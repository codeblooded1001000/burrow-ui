'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { OtpInput } from '@/components/ui/OtpInput';
import { Pill } from '@/components/ui/Pill';
import { Subhead } from '@/components/ui/Subhead';
import { toast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/api/hooks/use-current-user';
import { friendlyMessageForError } from '@/lib/api/error-messages';
import { useGetMyProfileQuery } from '@/lib/hooks/use-profiles';
import { useUploadProfilePhoto } from '@/lib/hooks/use-upload-profile-photo';
import { usePatchProfileMutation } from '@/lib/hooks/auth/use-auth-mutations';
import { usePatchUserPhoneMutation, useVerifyUserPhoneMutation } from '@/lib/hooks/use-phone-profile';
import type { FullProfilePutBody } from '@/lib/profile/build-full-profile-put';
import { computeProfileCompletion } from '@/lib/profile/profile-completion';
import { profileAboutSchema, type ProfileAboutForm } from '@/lib/schemas/profile-flow.schemas';
import { useProfileDraftStore } from '@/stores/profile-draft-store';
import { profileEditBackToAccount, withFromAccount } from '@/lib/profile/profile-edit-from-account';
import { resolveMediaRefToPublicUrl } from '@/lib/uploads/resolve-media-public-url';

export default function ProfileAboutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAccount = searchParams.get('from') === 'account';
  const backFromAbout = () => {
    const acc = profileEditBackToAccount(fromAccount);
    router.push(acc ?? '/profile/edit/intro');
  };
  const { user } = useCurrentUser();
  const { data: profile, isSuccess, isError } = useGetMyProfileQuery(Boolean(user));
  const loadFromProfile = useProfileDraftStore((s) => s.loadFromProfile);
  const setField = useProfileDraftStore((s) => s.setField);
  const advanceStep = useProfileDraftStore((s) => s.advanceStep);
  const draft = useProfileDraftStore();
  const patchPhone = usePatchUserPhoneMutation();
  const verifyPhone = useVerifyUserPhoneMutation();
  const patchProfile = usePatchProfileMutation();
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [localPhotoObjectUrl, setLocalPhotoObjectUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUpload = useUploadProfilePhoto();

  const clearLocalPhotoPreview = useCallback(() => {
    setLocalPhotoObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => () => clearLocalPhotoPreview(), [clearLocalPhotoPreview]);

  const avatarDisplayUrl = useMemo(() => {
    if (localPhotoObjectUrl) return localPhotoObjectUrl;
    if (!profile) return null;
    if (draft.pendingPhotoKey != null && draft.pendingPhotoKey.trim().length > 0) {
      return resolveMediaRefToPublicUrl(draft.pendingPhotoKey);
    }
    return resolveMediaRefToPublicUrl(profile.photoUrl);
  }, [localPhotoObjectUrl, profile, draft.pendingPhotoKey]);

  const persistAboutFromAccount = useCallback(
    async (values: ProfileAboutForm) => {
      if (!fromAccount || !profile) return;
      const body: Partial<FullProfilePutBody> = {
        bio: values.bio,
        profession: values.profession.trim() === '' ? null : values.profession,
        workSchedule: values.workSchedule ?? null,
      };
      const pk = draft.pendingPhotoKey?.trim();
      if (pk) body.photoUrl = pk;
      await patchProfile.mutateAsync(body);
      setField('pendingPhotoKey', null);
      clearLocalPhotoPreview();
    },
    [fromAccount, profile, draft.pendingPhotoKey, patchProfile, setField, clearLocalPhotoPreview],
  );

  const onPhotoSelected = useCallback(
    async (e: { target: HTMLInputElement }) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setLocalPhotoObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      try {
        const key = await photoUpload.upload(file);
        setField('pendingPhotoKey', key);
        toast.success(fromAccount ? 'Photo added.' : 'Photo uploaded. Save on the last step to apply.');
      } catch (err) {
        clearLocalPhotoPreview();
        toast.error(friendlyMessageForError(err));
      }
    },
    [photoUpload, setField, fromAccount, clearLocalPhotoPreview],
  );

  useEffect(() => {
    if (isSuccess && profile) loadFromProfile(profile);
  }, [isSuccess, profile, loadFromProfile]);

  const form = useForm<ProfileAboutForm>({
    resolver: zodResolver(profileAboutSchema),
    mode: 'onChange',
    defaultValues: {
      bio: draft.bio || '',
      profession: draft.profession || '',
      workSchedule: draft.workSchedule,
    },
  });

  const completion = profile
    ? computeProfileCompletion(
        {
          photoUrl: avatarDisplayUrl ?? profile.photoUrl,
          bio: form.watch('bio'),
          profession: form.watch('profession'),
          budgetMin: profile.budgetMin,
          budgetMax: profile.budgetMax,
          moveInDate: profile.moveInDate,
          lifestyleTags: profile.lifestyleTags,
        },
        { phoneVerified: false },
      )
    : 0;

  const goPreferences = () => {
    advanceStep('preferences');
    router.push(withFromAccount('/profile/edit/preferences', fromAccount));
  };

  const onContinue = form.handleSubmit(async (v) => {
    setField('bio', v.bio);
    setField('profession', v.profession);
    setField('workSchedule', v.workSchedule ?? null);
    const local = draft.phoneLocal.replace(/\D/g, '');
    if (local.length === 10) {
      if (fromAccount) {
        try {
          await persistAboutFromAccount(v);
        } catch (e) {
          toast.error(friendlyMessageForError(e));
          return;
        }
      }
      try {
        await patchPhone.mutateAsync({ phoneNumber: `+91${local}` });
        setOtpOpen(true);
        return;
      } catch (e) {
        toast.error(friendlyMessageForError(e));
        return;
      }
    }
    if (fromAccount) {
      try {
        await persistAboutFromAccount(v);
        toast.success('Saved.');
      } catch (e) {
        toast.error(friendlyMessageForError(e));
        return;
      }
    }
    goPreferences();
  });

  const finishPhone = async () => {
    try {
      await verifyPhone.mutateAsync({ otp });
      toast.success('Phone verified.');
      setOtpOpen(false);
      if (fromAccount) {
        try {
          await persistAboutFromAccount(form.getValues());
        } catch (e) {
          toast.error(friendlyMessageForError(e));
          return;
        }
      }
      goPreferences();
    } catch (e) {
      toast.error(friendlyMessageForError(e));
    }
  };

  const skipOtp = async () => {
    toast.info('Phone not verified yet. You can verify later in settings.');
    setOtpOpen(false);
    if (fromAccount) {
      try {
        await persistAboutFromAccount(form.getValues());
      } catch (e) {
        toast.error(friendlyMessageForError(e));
        return;
      }
    }
    goPreferences();
  };

  if (!user) {
    return null;
  }

  if (isError) {
    return (
      <PhoneShell progress={33} back onBack={backFromAbout}>
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Create your basics first, then return here.</p>
      </PhoneShell>
    );
  }

  if (!profile) {
    return (
      <PhoneShell progress={33} back onBack={backFromAbout}>
        <p className="mt-8 text-sm text-ink-secondary dark:text-dark-ink-secondary">Loading…</p>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell progress={33} back onBack={backFromAbout}>
      <Modal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        title="Enter the code we texted you"
        footer={
          <div className="flex flex-col gap-2">
            <Button type="button" variant="primary" disabled={otp.length !== 6 || verifyPhone.isPending} onClick={() => void finishPhone()}>
              Verify
            </Button>
            <Button type="button" variant="tertiary" onClick={skipOtp}>
              Skip for now
            </Button>
          </div>
        }
      >
        <OtpInput value={otp} onChange={setOtp} />
      </Modal>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>About you</Heading>
        <Subhead>Share a bit about how you live and work.</Subhead>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="relative inline-flex">
          <Avatar src={avatarDisplayUrl} alt={profile.fullName} size={96} fallbackLetter={profile.fullName} />
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-teal shadow-md ring-2 ring-cream transition-opacity hover:bg-teal-tint disabled:opacity-50 dark:border-dark-border dark:bg-dark-surface dark:text-dark-teal dark:ring-dark-bg dark:hover:bg-dark-teal-tint"
            aria-label="Change profile photo"
            disabled={photoUpload.isUploading}
            onClick={() => photoInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(ev) => void onPhotoSelected(ev)}
          />
        </div>
        <p className="text-center font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">
          JPEG, PNG or WebP · max 5 MB
        </p>
      </div>
      <form className="mt-8 flex flex-col gap-6" onSubmit={onContinue}>
        <div>
          <label htmlFor="bio" className="mb-2 block font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-base text-ink-primary outline-none focus:border-2 focus:border-teal dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary"
            {...form.register('bio')}
          />
          <p className="mt-1 text-right font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">{form.watch('bio').length}/500</p>
        </div>
        <Input label="Profession" placeholder="e.g. Software engineer" {...form.register('profession')} />
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2 dark:border-dark-border">
          <span className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Company</span>
          <span className="font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">{user.companyName}</span>
          {user.companyVerified ? <VerifiedBadge /> : null}
        </div>
        <Controller
          name="workSchedule"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="Work schedule"
              options={['Mostly home', 'Mostly office', 'Flexible']}
              value={
                field.value === 'HOME'
                  ? 'Mostly home'
                  : field.value === 'OFFICE'
                    ? 'Mostly office'
                    : field.value === 'FLEXIBLE'
                      ? 'Flexible'
                      : 'Mostly home'
              }
              onChange={(v) =>
                field.onChange(v === 'Mostly home' ? 'HOME' : v === 'Mostly office' ? 'OFFICE' : 'FLEXIBLE')
              }
            />
          )}
        />
        <div>
          <label htmlFor="phone" className="mb-2 block font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Phone (optional)
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 dark:border-dark-border dark:bg-dark-surface">
            <span className="shrink-0 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">+91</span>
            <input
              id="phone"
              inputMode="numeric"
              className="h-14 min-w-0 flex-1 bg-transparent font-sans text-base text-ink-primary outline-none dark:text-dark-ink-primary"
              value={draft.phoneLocal}
              onChange={(e) => setField('phoneLocal', e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
        </div>
        <p className="font-sans text-xs text-ink-tertiary dark:text-dark-ink-tertiary">
          Profile {completion}% complete — adding a verified phone number helps you get more responses.
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={!form.formState.isValid || patchPhone.isPending || patchProfile.isPending}
        >
          {fromAccount ? 'Save & continue' : 'Continue'}
        </Button>
      </form>
    </PhoneShell>
  );
}
