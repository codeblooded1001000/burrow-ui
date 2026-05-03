import { cn } from '@/lib/utils/cn';

type VerifiedBadgeProps = {
  size?: 14 | 18;
  className?: string;
  companyName?: string;
  /** Override company text color (e.g. muted subtitle on account header). */
  companyClassName?: string;
};

export function VerifiedBadge({ size = 14, className, companyName, companyClassName }: VerifiedBadgeProps) {
  const strokeW = size === 14 ? 1.5 : 1.75;

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={cn('shrink-0', !companyName && className)}
      aria-hidden
    >
      <circle cx="7" cy="7" r="7" className="fill-forest dark:fill-dark-forest" />
      <polyline
        points="4,7.2 6.2,9.4 10,5"
        stroke="white"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (!companyName) {
    return (
      <span className={cn('inline-flex', className)} role="img" aria-label="Verified">
        {icon}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5', className)}>
      {icon}
      <span
        className={cn(
          'truncate font-sans text-sm font-medium text-ink-primary dark:text-dark-ink-primary',
          companyClassName,
        )}
      >
        {companyName}
      </span>
    </span>
  );
}
