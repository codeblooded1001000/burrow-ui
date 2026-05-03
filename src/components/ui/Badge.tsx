import { cn } from '@/lib/utils/cn';
import { VerifiedBadge } from '@/components/brand/VerifiedBadge';

type BadgeProps = {
  variant: 'verified' | 'neutral' | 'warning';
  children?: React.ReactNode;
  companyName?: string;
  className?: string;
};

export function Badge({ variant, children, companyName, className }: BadgeProps) {
  if (variant === 'verified') {
    if (companyName) {
      return <VerifiedBadge size={14} companyName={companyName} className={className} />;
    }
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <VerifiedBadge size={14} />
        {children ? (
          <span className="truncate font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary">{children}</span>
        ) : null}
      </span>
    );
  }

  if (variant === 'warning') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-terracotta/25 bg-[rgba(197,87,61,0.08)] px-2.5 py-1 font-sans text-xs font-medium text-terracotta dark:border-dark-terracotta/30 dark:bg-[rgba(216,122,96,0.10)] dark:text-dark-terracotta',
          className,
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-cream px-2.5 py-1 font-sans text-xs font-medium text-ink-secondary dark:border-dark-border dark:bg-dark-bg dark:text-dark-ink-secondary',
        className,
      )}
    >
      {children}
    </span>
  );
}
