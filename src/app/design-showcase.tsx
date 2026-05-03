'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { Wordmark } from '@/components/brand/Wordmark';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';
import { AppShell } from '@/components/layout/AppShell';
import { PhoneShell } from '@/components/layout/PhoneShell';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/ui/BottomNav';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { OtpInput } from '@/components/ui/OtpInput';
import { PhotoUploader } from '@/components/ui/PhotoUploader';
import { Pill } from '@/components/ui/Pill';
import { PinInput } from '@/components/ui/PinInput';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Subhead } from '@/components/ui/Subhead';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-12 dark:border-dark-border">
      <h2 className="mb-8 font-serif text-2xl font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary">{title}</h2>
      {children}
    </section>
  );
}

export function DesignShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pillSingle, setPillSingle] = useState('Woman');
  const [pillMulti, setPillMulti] = useState<string[]>(['Chill']);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');

  return (
    <div className="min-h-screen bg-cream pb-24 dark:bg-dark-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur dark:border-dark-border dark:bg-dark-surface/95">
        <Heading as="h1" size={22}>
          Design system showcase
        </Heading>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/browse" className="font-sans text-sm font-medium text-teal underline dark:text-dark-teal">
            Exit to app shell
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4">
        <Section title="Brand">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end gap-6">
              <Wordmark size={16} />
              <Wordmark size={24} />
              <Wordmark size={32} />
              <Wordmark size={48} />
              <Wordmark size={72} className="hidden sm:block" />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <VerifiedBadge size={14} />
              <VerifiedBadge size={18} />
              <VerifiedBadge size={14} companyName="Deloitte" />
              <Badge variant="verified" companyName="Accenture" />
              <Badge variant="neutral">Draft</Badge>
              <Badge variant="warning">Needs attention</Badge>
            </div>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Button variant="primary">Primary default</Button>
              <Button variant="primary" size="sm">
                Primary small
              </Button>
              <Button variant="primary" loading>
                Primary loading
              </Button>
              <Button variant="primary" disabled>
                Primary disabled
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="secondary">Secondary</Button>
              <Button variant="secondary" size="sm">
                Secondary small
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="tertiary">Tertiary action</Button>
              <Button variant="tertiary" loading>
                Tertiary loading
              </Button>
            </div>
            <Button variant="primary" as={Link} href="/browse">
              As link to Browse
            </Button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="flex max-w-sm flex-col gap-8">
            <Input label="Work email" placeholder="your.name@company.com" type="email" microcopy="Personal emails will not work." />
            <Input label="With error" placeholder="name@gmail.com" defaultValue="name@gmail.com" error="This email is not recognized. Try your work email." />
            <Input label="Loading" placeholder="checking…" loading defaultValue="priya@deloitte.com" readOnly />
            <OtpInput label="OTP (paste 6 digits)" value={otp} onChange={setOtp} />
            <PinInput label="PIN" value={pin} onChange={setPin} />
          </div>
        </Section>

        <Section title="Selectors">
          <div className="flex max-w-sm flex-col gap-8">
            <Pill label="I am" options={['Woman', 'Man', 'Prefer not to say']} value={pillSingle} onChange={(v) => setPillSingle(v as string)} />
            <Pill
              label="Multi"
              multi
              options={['Chill', 'Foodie', 'Night owl']}
              value={pillMulti}
              onChange={(v) => setPillMulti(v as string[])}
            />
            <div className="flex flex-wrap gap-2">
              <Chip variant="tag" selected={false} onClick={() => undefined}>
                Tag off
              </Chip>
              <Chip variant="tag" selected onClick={() => undefined}>
                Tag on
              </Chip>
              <Chip variant="filter" selected onClick={() => undefined}>
                Filter on
              </Chip>
              <Chip variant="filter" onRemove={() => undefined}>
                Cyber City
              </Chip>
            </div>
            <div className="flex flex-col gap-3">
              <Card>
                <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Default card</p>
              </Card>
              <Card variant="selectable" selected={false} onSelect={() => undefined}>
                <p className="font-serif text-lg font-medium text-ink-primary dark:text-dark-ink-primary">Selectable</p>
                <p className="mt-1 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Tap to select</p>
              </Card>
              <Card variant="selectable" selected onSelect={() => undefined}>
                <p className="font-serif text-lg font-medium text-teal dark:text-dark-teal">Selected card</p>
              </Card>
            </div>
          </div>
        </Section>

        <Section title="Feedback">
          <div className="flex max-w-sm flex-col gap-4">
            <Button type="button" variant="secondary" onClick={() => toast.success('Verification complete. Welcome to Burrow.')}>
              Toast success
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                toast.error('Could not send the code. Check your connection.', {
                  action: { label: 'Retry', onClick: () => toast.dismiss() },
                })
              }
            >
              Toast error + action
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                toast.info('Your listing was saved as a draft.', {
                  action: { label: 'View', onClick: () => toast.dismiss() },
                })
              }
            >
              Toast info
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(true)}>
                Open modal
              </Button>
              <Button type="button" variant="secondary" onClick={() => setSheetOpen(true)}>
                Open bottom sheet
              </Button>
            </div>
            <Modal
              open={modalOpen}
              onOpenChange={setModalOpen}
              title="Block this person?"
              description="They will not see your profile or message you. You can unblock anytime from settings."
              footer={
                <>
                  <Button variant="primary" className="bg-terracotta hover:bg-terracotta/90 dark:bg-dark-terracotta dark:hover:bg-dark-terracotta/90" onClick={() => setModalOpen(false)}>
                    Block
                  </Button>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                </>
              }
            >
              <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Modal body copy goes here.</p>
            </Modal>
            <BottomSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              title="Locality"
              footer={<Button variant="primary">Apply (2 selected)</Button>}
            >
              <ul className="font-sans text-sm text-ink-primary dark:text-dark-ink-primary">
                <li className="border-b border-border py-3 dark:border-dark-border">Cyber City</li>
                <li className="border-b border-border py-3 dark:border-dark-border">Golf Course Road</li>
                <li className="py-3">Sector 48</li>
              </ul>
            </BottomSheet>
          </div>
        </Section>

        <Section title="States">
          <div className="flex flex-col gap-12">
            <EmptyState
              title="No flatmates match these filters"
              description="Try widening your locality or adjusting your budget range."
              actionLabel="Adjust filters"
              onAction={() => toast.info('Stub action')}
            />
            <ErrorState onRetry={() => toast.success('Retry tapped')} />
            <LoadingState />
            <div className="flex max-w-sm flex-col gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </Section>

        <Section title="Typography">
          <div className="flex flex-col gap-4">
            <Heading size={32}>Heading 32</Heading>
            <Heading size={28}>Heading 28</Heading>
            <Heading size={22}>Heading 22</Heading>
            <Heading size={18}>Heading 18</Heading>
            <Subhead>Inter subhead — secondary color, comfortable line height for onboarding copy.</Subhead>
            <p className="font-sans text-base text-ink-primary dark:text-dark-ink-primary">
              Body: verified professionals in Gurgaon. Every profile ties to a real company per the master spec.
            </p>
          </div>
        </Section>

        <Section title="Layout">
          <div className="mb-10 flex flex-col gap-4">
            <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">PhoneShell (progress + back stub)</p>
            <PhoneShell progress={40} back onBack={() => toast.info('Back')}>
              <p className="mt-6 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">Scrollable flow content area.</p>
            </PhoneShell>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">AppShell (contained preview)</p>
            <AppShell contained>
              <div className="space-y-4 px-4 py-6">
                <Heading size={22}>In-app surface</Heading>
                <Subhead>Bottom nav is absolute within the preview frame.</Subhead>
                <PhotoUploader />
                <Avatar alt="Priya Sharma" size={64} fallbackLetter="P" />
              </div>
            </AppShell>
          </div>
        </Section>

        <Section title="Navigation">
          <p className="mb-4 font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
            Three previews with forced active tab. Full bar also respects pathname on real routes (visit /browse, /inbox, /account).
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative h-28 rounded-lg border border-dashed border-border dark:border-dark-border">
              <BottomNav contained activeTab="explore" />
            </div>
            <div className="relative h-28 rounded-lg border border-dashed border-border dark:border-dark-border">
              <BottomNav contained activeTab="messages" hasUnreadMessages />
            </div>
            <div className="relative h-28 rounded-lg border border-dashed border-border dark:border-dark-border">
              <BottomNav contained activeTab="profile" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
