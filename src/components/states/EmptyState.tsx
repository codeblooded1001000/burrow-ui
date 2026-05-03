import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';

type EmptyStateProps = {
  illustration?: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  className?: string;
  actionVariant?: 'primary' | 'tertiary';
};

export function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  className,
  actionVariant = 'primary',
}: EmptyStateProps) {
  return (
    <div className={`flex max-w-[280px] flex-col items-center gap-5 text-center ${className ?? ''}`}>
      {illustration ?? <DefaultIllustration />}
      <div className="flex flex-col gap-2">
        <Heading as="h2" size={22}>
          {title}
        </Heading>
        <p className="font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">{description}</p>
      </div>
      <div className="w-full pt-1">
        <Button type="button" variant={actionVariant === 'tertiary' ? 'tertiary' : 'primary'} onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function DefaultIllustration() {
  return (
    <svg width="120" height="88" viewBox="0 0 120 88" fill="none" className="text-border dark:text-dark-border" aria-hidden>
      <rect x="16" y="28" width="88" height="52" rx="4" stroke="currentColor" strokeWidth="1.4" className="text-border dark:text-dark-border" />
      <rect x="28" y="40" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M62 44h28M62 52h20M62 60h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="60" cy="18" r="10" className="stroke-teal/60 dark:stroke-dark-teal/60" strokeWidth="1.4" />
      <path d="M56 18h8M60 14v8" className="stroke-teal/40 dark:stroke-dark-teal/40" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M68 25l8 8" className="stroke-teal/50 dark:stroke-dark-teal/50" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 28 Q60 8 104 28" className="stroke-teal/20 dark:stroke-dark-teal/20" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
