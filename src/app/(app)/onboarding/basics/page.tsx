'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { Pill } from '@/components/ui/Pill';
import { Subhead } from '@/components/ui/Subhead';
import { BasicsFormSchema, basicsFormToInput, type BasicsFormValues } from '@/lib/schemas/auth.schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function OnboardingBasicsPage() {
  const router = useRouter();
  const setBasics = useOnboardingStore((s) => s.setBasics);
  const advanceStep = useOnboardingStore((s) => s.advanceStep);

  const form = useForm<BasicsFormValues>({
    resolver: zodResolver(BasicsFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      age: 18,
      genderUi: 'Woman',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setBasics(basicsFormToInput(values));
    advanceStep('role');
    router.push('/onboarding/role');
  });

  return (
    <PhoneShell progress={67}>
      <div className="mt-6 flex flex-col gap-3">
        <Heading size={28}>A few quick basics</Heading>
        <Subhead>Takes 30 seconds. You can edit anything later.</Subhead>
      </div>
      <form className="mt-6 flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col items-center gap-2">
          <PhotoUploader />
          <Button type="button" variant="tertiary" className="w-auto text-[13px]">
            Skip for now — add later
          </Button>
        </div>
        <Input label="Full name" placeholder="Priya Sharma" error={form.formState.errors.fullName?.message} {...form.register('fullName')} />
        <Input label="Age" type="number" inputMode="numeric" error={form.formState.errors.age?.message} {...form.register('age', { valueAsNumber: true })} />
        <Controller
          name="genderUi"
          control={form.control}
          render={({ field }) => (
            <Pill
              label="I am"
              options={['Woman', 'Man', 'Prefer not to say']}
              value={field.value}
              onChange={(v) => field.onChange(v as BasicsFormValues['genderUi'])}
            />
          )}
        />
        <Button type="submit" variant="primary" disabled={!form.formState.isValid}>
          Continue
        </Button>
      </form>
    </PhoneShell>
  );
}
